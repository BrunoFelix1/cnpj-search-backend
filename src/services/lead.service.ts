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
    this.setCached(cnpj, mapped);
    return mapped;
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
