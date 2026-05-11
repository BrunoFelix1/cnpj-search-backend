import type {
  LeadCnpjResponse,
  LeadDashboardResponse,
  LeadDashboardStatus,
  LeadDashboardTaxRegimeItem,
} from '../types/lead.types';
import {
  NOT_INFORMED,
  calculateYearsInBusiness,
  formatCnae,
  formatCnpj,
  formatCurrency,
  formatDate,
  formatPhone,
  formatZipCode,
  safeNumber,
  safeText,
} from '../utils/formatters';

const normalizeStatus = (
  value: string,
): 'ACTIVE' | 'CLOSED' | 'SUSPENDED' | 'UNKNOWN' => {
  const upper = value.toUpperCase();
  if (upper.includes('ATIVA')) {
    return 'ACTIVE';
  }
  if (upper.includes('BAIXADA') || upper.includes('ENCERRADA')) {
    return 'CLOSED';
  }
  if (upper.includes('SUSPENSA')) {
    return 'SUSPENDED';
  }
  return 'UNKNOWN';
};

const statusColorByCode = (
  status: LeadDashboardStatus['registrationStatus'],
): string => {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'CLOSED':
      return 'red';
    case 'SUSPENDED':
      return 'yellow';
    default:
      return 'gray';
  }
};

const buildAddress = (data: LeadCnpjResponse): string => {
  const streetType = safeText(data.descricao_tipo_de_logradouro, '');
  const streetName = safeText(data.logradouro, '');
  const number = safeText(data.numero, '');
  const complement = safeText(data.complemento, '');
  const neighborhood = safeText(data.bairro, '');
  const city = safeText(data.municipio, '');
  const state = safeText(data.uf, '');
  const zip = formatZipCode(data.cep);

  const parts: string[] = [];
  const street = [streetType, streetName].filter(Boolean).join(' ').trim();
  if (street) {
    parts.push(street);
  }
  if (number) {
    parts.push(number);
  }
  if (complement) {
    parts.push(complement);
  }
  if (neighborhood) {
    parts.push(neighborhood);
  }

  const addressLine = parts.join(', ');
  const cityState = [city, state].filter(Boolean).join('/');
  const locationLine = [addressLine, cityState].filter(Boolean).join(' - ');
  const zipLine = zip ? `ZIP Code: ${zip}` : '';
  return [locationLine, zipLine].filter(Boolean).join(', ');
};

const buildInsights = (
  response: LeadCnpjResponse,
  mapped: LeadDashboardResponse,
): string[] => {
  const insights: string[] = [];
  const years = mapped.metrics.yearsInBusiness;
  if (mapped.metrics.isActive && years >= 10) {
    insights.push('Company active for more than 10 years');
  }

  const activityText = [mapped.mainActivity.description]
    .concat(mapped.secondaryActivities.map((activity) => activity.description))
    .join(' ')
    .toLowerCase();
  if (
    activityText.includes('tecnologia') ||
    activityText.includes('software') ||
    activityText.includes('informacao') ||
    activityText.includes('telecom')
  ) {
    insights.push('Operates in technology-related activities');
  }

  const legalNature = safeText(response.natureza_juridica, '');
  if (
    legalNature.toUpperCase().includes('ASSOCIACAO') ||
    legalNature.toUpperCase().includes('FUNDACAO') ||
    legalNature.toUpperCase().includes('INSTITUTO')
  ) {
    insights.push('Nonprofit organization');
  }

  if (mapped.metrics.secondaryActivitiesCount > 0) {
    insights.push('Has multiple business activities');
  }

  if (mapped.company.branchType === 'Headquarters') {
    insights.push('Headquarters company');
  }

  return insights;
};

const mapTaxRegime = (
  items: LeadCnpjResponse['regime_tributario'],
): LeadDashboardTaxRegimeItem[] => {
  return (items ?? [])
    .map((item) => ({
      year: item?.ano ?? 0,
      taxRegime: safeText(item?.forma_de_tributacao),
    }))
    .sort((a, b) => a.year - b.year);
};

export const mapLeadCnpjToDashboard = (
  response: LeadCnpjResponse,
): LeadDashboardResponse => {
  const yearsInBusiness = calculateYearsInBusiness(
    response.data_inicio_atividade,
  );
  const registrationLabel = safeText(response.descricao_situacao_cadastral);
  const normalizedStatus = normalizeStatus(registrationLabel);
  const statusColor = statusColorByCode(normalizedStatus);
  const phonePrimary = formatPhone(response.ddd_telefone_1, '');
  const phoneSecondary = formatPhone(response.ddd_telefone_2, '');
  let formattedPhonePrimary = '';
  if (phonePrimary.length > 2) {
    formattedPhonePrimary = phonePrimary;
  } else if (phoneSecondary.length > 2) {
    formattedPhonePrimary = phoneSecondary;
  }
  const email = response.email?.trim() ?? '';
  const hasContactInfo = Boolean(formattedPhonePrimary || email);
  const secondaryActivities = (response.cnaes_secundarios ?? []).map(
    (activity) => ({
      code: formatCnae(activity?.codigo ?? ''),
      description: safeText(activity?.descricao),
    }),
  );
  const partners = (response.qsa ?? []).map((partner) => ({
    name: safeText(partner?.nome_socio),
    role: safeText(partner?.qualificacao_socio),
    ageRange: safeText(partner?.faixa_etaria),
    entryDate: formatDate(partner?.data_entrada_sociedade),
  }));
  const taxRegime = mapTaxRegime(response.regime_tributario);
  const latestTaxRegime = taxRegime.at(-1);
  const currentTaxRegime = latestTaxRegime?.taxRegime ?? NOT_INFORMED;

  const mapped: LeadDashboardResponse = {
    company: {
      corporateName: safeText(response.razao_social),
      tradeName: safeText(response.nome_fantasia),
      formattedCnpj: formatCnpj(response.cnpj),
      legalNature: safeText(response.natureza_juridica),
      companySize: safeText(response.porte),
      branchType: (() => {
        const branch = response.descricao_identificador_matriz_filial;
        if (branch === 'MATRIZ') {
          return 'Headquarters';
        }
        if (branch === 'FILIAL') {
          return 'Branch';
        }
        return safeText(branch);
      })(),
      openingDate: formatDate(response.data_inicio_atividade),
      yearsInBusiness,
    },
    status: {
      registrationStatus: normalizedStatus,
      statusColor,
      statusDate: formatDate(response.data_situacao_cadastral),
      statusReason: safeText(response.descricao_motivo_situacao_cadastral),
    },
    location: {
      formattedAddress: buildAddress(response),
      city: safeText(response.municipio),
      state: safeText(response.uf),
      formattedZipCode: formatZipCode(response.cep),
    },
    contacts: {
      formattedPhone: formattedPhonePrimary,
      email: email || '',
      hasContactInfo,
    },
    mainActivity: {
      formattedCode: formatCnae(response.cnae_fiscal),
      description: safeText(response.cnae_fiscal_descricao),
    },
    secondaryActivities,
    partners,
    taxRegime,
    metrics: {
      yearsInBusiness,
      partnersCount: partners.length,
      secondaryActivitiesCount: secondaryActivities.length,
      shareCapital: formatCurrency(safeNumber(response.capital_social)),
      isActive: normalizedStatus === 'ACTIVE',
    },
    insights: [],
    secondaryActivitiesCount: secondaryActivities.length,
    partnersCount: partners.length,
    currentTaxRegime,
  };

  mapped.insights = buildInsights(response, mapped);

  return mapped;
};
