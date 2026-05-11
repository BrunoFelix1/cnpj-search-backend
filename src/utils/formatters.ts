export const NOT_INFORMED = 'Not informed';

const onlyDigits = (value: string): string => value.replaceAll(/\D/g, '');

export const safeText = (
  value: string | null | undefined,
  fallback: string = NOT_INFORMED,
): string => {
  const normalized = value?.trim() ?? '';
  return normalized.length > 0 ? normalized : fallback;
};

export const safeNumber = (value: number | null | undefined): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

export const formatCnpj = (value: string | null | undefined): string => {
  const digits = onlyDigits(value ?? '');
  if (digits.length !== 14) {
    return digits;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8,
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

export const formatZipCode = (value: string | null | undefined): string => {
  const digits = onlyDigits(value ?? '');
  if (digits.length !== 8) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const formatPhone = (
  ddd: string | null | undefined,
  phone?: string | null,
): string => {
  const digits = onlyDigits(`${ddd ?? ''}${phone ?? ''}`);
  const trimmed = digits.length > 11 ? digits.slice(-11) : digits;
  if (trimmed.length === 10) {
    return `(${trimmed.slice(0, 2)}) ${trimmed.slice(2, 6)}-${trimmed.slice(6)}`;
  }
  if (trimmed.length === 11) {
    return `(${trimmed.slice(0, 2)}) ${trimmed.slice(2, 7)}-${trimmed.slice(7)}`;
  }
  return trimmed;
};

export const formatCurrency = (value: number | null | undefined): string => {
  const normalized = safeNumber(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(normalized);
};

export const formatDate = (value: string | null | undefined): string => {
  const normalized = value?.trim();
  if (!normalized) {
    return NOT_INFORMED;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split('-');
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return NOT_INFORMED;
  }
  return new Intl.DateTimeFormat('pt-BR').format(parsed);
};

export const formatCnae = (
  value: number | string | null | undefined,
): string => {
  const digits = onlyDigits(String(value ?? ''));
  if (digits.length < 7) {
    return digits;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 5)}/${digits.slice(5, 7)}`;
};

export const calculateYearsInBusiness = (
  value: string | null | undefined,
): number => {
  const normalized = value?.trim();
  if (!normalized) {
    return 0;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }
  const today = new Date();
  let years = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < parsed.getDate())
  ) {
    years -= 1;
  }
  return Math.max(years, 0);
};
