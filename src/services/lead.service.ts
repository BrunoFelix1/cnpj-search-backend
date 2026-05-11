import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { SearchLeadDto } from '../types/lead.types';

@Injectable()
export class LeadService {
  async searchByCnpj(dto: SearchLeadDto) {
    const rawCnpj = dto.cnpj?.trim() ?? '';
    const cnpj = rawCnpj.replaceAll(/\D/g, '');
    if (!cnpj) {
      throw new BadRequestException('cnpj is required');
    }
    if (cnpj.length !== 14) {
      throw new BadRequestException('cnpj must have 14 digits');
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

    return response.json();
  }
}
