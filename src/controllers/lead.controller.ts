import { Body, Controller, Post } from '@nestjs/common';
import { LeadService } from '../services/lead.service';
import type { LeadCnpjResponse, SearchLeadDto } from '../types/lead.types';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post('search')
  async searchLead(@Body() dto: SearchLeadDto): Promise<LeadCnpjResponse> {
    return this.leadService.searchByCnpj(dto);
  }
}
