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
