export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SearchLeadDto = Partial<
  Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
>;

export type CnpjQsa = {
  pais: string | null;
  nome_socio: string;
  codigo_pais: string | null;
  faixa_etaria: string;
  cnpj_cpf_do_socio: string;
  qualificacao_socio: string;
  codigo_faixa_etaria: number;
  data_entrada_sociedade: string;
  identificador_de_socio: number;
  cpf_representante_legal: string;
  nome_representante_legal: string;
  codigo_qualificacao_socio: number;
  qualificacao_representante_legal: string;
  codigo_qualificacao_representante_legal: number;
};

export type CnaeSecundario = {
  codigo: number;
  descricao: string;
};

export type RegimeTributario = {
  ano: number;
  cnpj_da_scp: string | null;
  forma_de_tributacao: string;
  quantidade_de_escrituracoes: number;
};

export type LeadCnpjResponse = {
  uf: string;
  cep: string;
  qsa: CnpjQsa[];
  cnpj: string;
  pais: string | null;
  email: string | null;
  porte: string;
  bairro: string;
  numero: string;
  ddd_fax: string;
  municipio: string;
  logradouro: string;
  cnae_fiscal: number;
  codigo_pais: string | null;
  complemento: string;
  codigo_porte: number;
  razao_social: string;
  nome_fantasia: string;
  capital_social: number;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  opcao_pelo_mei: string | null;
  codigo_municipio: number;
  cnaes_secundarios: CnaeSecundario[];
  natureza_juridica: string;
  regime_tributario: RegimeTributario[];
  situacao_especial: string;
  opcao_pelo_simples: string | null;
  situacao_cadastral: number;
  data_opcao_pelo_mei: string | null;
  data_exclusao_do_mei: string | null;
  cnae_fiscal_descricao: string;
  codigo_municipio_ibge: number;
  data_inicio_atividade: string;
  data_situacao_especial: string | null;
  data_opcao_pelo_simples: string | null;
  data_situacao_cadastral: string;
  nome_cidade_no_exterior: string;
  codigo_natureza_juridica: number;
  data_exclusao_do_simples: string | null;
  motivo_situacao_cadastral: number;
  ente_federativo_responsavel: string;
  identificador_matriz_filial: number;
  qualificacao_do_responsavel: number;
  descricao_situacao_cadastral: string;
  descricao_tipo_de_logradouro: string;
  descricao_motivo_situacao_cadastral: string;
  descricao_identificador_matriz_filial: string;
};

export type LeadDashboardCompany = {
  corporateName: string;
  tradeName: string;
  formattedCnpj: string;
  legalNature: string;
  companySize: string;
  branchType: string;
  openingDate: string;
  yearsInBusiness: number;
};

export type LeadDashboardStatus = {
  registrationStatus: 'ACTIVE' | 'CLOSED' | 'SUSPENDED' | 'UNKNOWN';
  statusColor: string;
  statusDate: string;
  statusReason: string;
};

export type LeadDashboardLocation = {
  formattedAddress: string;
  city: string;
  state: string;
  formattedZipCode: string;
  latitude: number | null;
  longitude: number | null;
};

export type LeadDashboardContacts = {
  formattedPhone: string;
  email: string;
  hasContactInfo: boolean;
};

export type LeadDashboardMainActivity = {
  formattedCode: string;
  description: string;
};

export type LeadDashboardSecondaryActivity = {
  code: string;
  description: string;
};

export type LeadDashboardPartner = {
  name: string;
  role: string;
  ageRange: string;
  entryDate: string;
};

export type LeadDashboardTaxRegimeItem = {
  year: number;
  taxRegime: string;
};

export type LeadDashboardMetrics = {
  yearsInBusiness: number;
  partnersCount: number;
  secondaryActivitiesCount: number;
  shareCapital: string;
  isActive: boolean;
};

export type LeadDashboardResponse = {
  company: LeadDashboardCompany;
  status: LeadDashboardStatus;
  location: LeadDashboardLocation;
  contacts: LeadDashboardContacts;
  mainActivity: LeadDashboardMainActivity;
  secondaryActivities: LeadDashboardSecondaryActivity[];
  partners: LeadDashboardPartner[];
  taxRegime: LeadDashboardTaxRegimeItem[];
  metrics: LeadDashboardMetrics;
  insights: string[];
  secondaryActivitiesCount: number;
  partnersCount: number;
  currentTaxRegime: string;
};
