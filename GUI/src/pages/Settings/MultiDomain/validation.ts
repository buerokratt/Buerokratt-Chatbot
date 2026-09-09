export const normalizeUrl = (url: string) => {
  const trimmed = url.trim();
  return trimmed.endsWith('/') ? trimmed : trimmed + '/';
};

export const normalizeUrlForComparison = (url: string) => normalizeUrl(url).toLowerCase();

export const isBlank = (value: string | undefined | null): boolean => {
  return !value || value.trim().length === 0;
};

export type DomainLike = {
  name: string;
  url: string;
};

export const hasDuplicateName = (domains: DomainLike[], value: string, index: number): boolean => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  return domains.some((domain, i) => i !== index && domain.name.trim().toLowerCase() === trimmed);
};

export const hasDuplicateUrl = (domains: DomainLike[], value: string, index: number): boolean => {
  if (!value.trim()) return false;
  const normalized = normalizeUrlForComparison(value);
  return domains.some((domain, i) => i !== index && normalizeUrlForComparison(domain.url) === normalized);
};
