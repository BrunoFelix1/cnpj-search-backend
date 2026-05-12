import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { mapLeadCnpjToDashboard } from '../mappers/lead.mapper';
import type {
  LeadCnpjResponse,
  LeadDashboardResponse,
  SearchLeadDto,
} from '../types/lead.types';

@Injectable()
export class LeadService {
  private static readonly cache = new Map<
    string,
    { data: LeadDashboardResponse; expiresAt: number }
  >();

  async searchByCnpj(dto: SearchLeadDto): Promise<LeadDashboardResponse> {
    const rawCnpj = dto.cnpj?.trim() ?? '';
    const cnpj = rawCnpj.replaceAll(/\D/g, '');
    if (!cnpj) {
      throw new BadRequestException('cnpj is required');
    }
    if (cnpj.length !== 14) {
      throw new BadRequestException('cnpj must have 14 digits');
    }

    const cached = this.getCached(cnpj);
    if (cached) {
      if (cached.location.latitude && cached.location.longitude) {
        return cached;
      }
      const coordinates = await this.fetchCoordinatesFromCache(cnpj, cached);
      if (coordinates) {
        return coordinates;
      }
      return cached;
    }

    const baseUrl = process.env.CNPJ_API_URL;
    if (!baseUrl) {
      throw new InternalServerErrorException('CNPJ_API_URL is not configured');
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/${cnpj}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'cnpj-search-backend/1.0',
        },
      });
    } catch (error) {
      console.error('Error fetching CNPJ data:', error);
      throw new BadGatewayException('CNPJ lookup failed');
    }

    if (response.status === 404) {
      throw new NotFoundException('cnpj not found');
    }

    if (!response.ok) {
      const details = await response.text();
      throw new BadGatewayException(
        details ? `CNPJ lookup failed: ${details}` : 'CNPJ lookup failed',
      );
    }

    const payload = (await response.json()) as LeadCnpjResponse;
    const mapped = mapLeadCnpjToDashboard(payload);
    const coordinates = await this.fetchCoordinates(payload);
    if (coordinates) {
      mapped.location.latitude = coordinates.latitude;
      mapped.location.longitude = coordinates.longitude;
    }
    this.setCached(cnpj, mapped);
    return mapped;
  }

  private async fetchCoordinates(
    data: LeadCnpjResponse,
  ): Promise<{ latitude: number; longitude: number } | null> {
    const baseUrl =
      process.env.GEOCODE_API_URL ??
      'https://nominatim.openstreetmap.org/search';
    const requests = this.buildGeocodeRequests(data);
    for (const request of requests) {
      const coords = await this.getCoordinatesFromQuery(baseUrl, request);
      if (coords) {
        return coords;
      }
    }
    return null;
  }

  private buildGeocodeRequests(
    data: LeadCnpjResponse,
  ): Array<{ q?: string; params?: Record<string, string> }> {
    const streetLine = [
      data.descricao_tipo_de_logradouro,
      data.logradouro,
      data.numero,
    ]
      .map((value) => (value ?? '').toString().trim())
      .filter(Boolean)
      .join(' ');
    const city = (data.municipio ?? '').toString().trim();
    const state = (data.uf ?? '').toString().trim();
    const postalcode = (data.cep ?? '').toString().trim();

    const structuredParams: Record<string, string> = {
      country: 'Brazil',
    };
    if (streetLine) {
      structuredParams.street = streetLine;
    }
    if (city) {
      structuredParams.city = city;
    }
    if (state) {
      structuredParams.state = state;
    }
    if (postalcode) {
      structuredParams.postalcode = postalcode;
    }

    const fallbackParts = [city, state, 'Brazil']
      .map((value) => (value ?? '').toString().trim())
      .filter(Boolean);
    const fallbackQuery = fallbackParts.join(', ');

    const requests: Array<{ q?: string; params?: Record<string, string> }> = [];
    if (Object.keys(structuredParams).length > 1) {
      requests.push({ params: structuredParams });
    }
    if (fallbackQuery) {
      requests.push({ q: fallbackQuery });
    }
    return requests;
  }

  private async getCoordinatesFromQuery(
    baseUrl: string,
    request: { q?: string; params?: Record<string, string> },
  ): Promise<{ latitude: number; longitude: number } | null> {
    if (!request.q && !request.params) {
      return null;
    }

    const url = new URL(baseUrl);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    if (request.q) {
      url.searchParams.set('q', request.q);
    }
    if (request.params) {
      for (const [key, value] of Object.entries(request.params)) {
        if (value) {
          url.searchParams.set(key, value);
        }
      }
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'cnpj-search-backend/1.0',
        },
      });
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as Array<
        Partial<{ lat: string; lon: string }>
      >;
      const first = payload[0];
      if (!first?.lat || !first?.lon) {
        return null;
      }
      const latitude = Number(first.lat);
      const longitude = Number(first.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }
      return { latitude, longitude };
    } catch (error) {
      console.error('Error fetching geocode data:', error);
      return null;
    }
  }

  private async fetchCoordinatesFromCache(
    cnpj: string,
    cached: LeadDashboardResponse,
  ): Promise<LeadDashboardResponse | null> {
    const baseUrl = process.env.CNPJ_API_URL;
    if (!baseUrl) {
      return null;
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/${cnpj}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'cnpj-search-backend/1.0',
        },
      });
    } catch {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as LeadCnpjResponse;
    const coordinates = await this.fetchCoordinates(payload);
    if (!coordinates) {
      return null;
    }

    const updated: LeadDashboardResponse = {
      ...cached,
      location: {
        ...cached.location,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
    };
    this.setCached(cnpj, updated);
    return updated;
  }

  private getCached(cnpj: string): LeadDashboardResponse | null {
    const cached = LeadService.cache.get(cnpj);
    if (!cached) {
      return null;
    }
    if (cached.expiresAt < Date.now()) {
      LeadService.cache.delete(cnpj);
      return null;
    }
    return cached.data;
  }

  private setCached(cnpj: string, data: LeadDashboardResponse): void {
    const ttl = Number(process.env.CNPJ_CACHE_TTL_MS ?? 300000);
    const ttlMs = Number.isFinite(ttl) && ttl > 0 ? ttl : 300000;
    LeadService.cache.set(cnpj, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }
}
