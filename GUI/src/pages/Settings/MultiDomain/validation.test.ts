import { describe, expect, it } from 'vitest';

import { hasDuplicateName, hasDuplicateUrl, isBlank, normalizeUrl } from './validation';

describe('MultiDomain validation', () => {
  it('treats empty and whitespace-only values as blank', () => {
    expect(isBlank('')).toBe(true);
    expect(isBlank('   ')).toBe(true);
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank(null)).toBe(true);
    expect(isBlank('x')).toBe(false);
  });

  it('detects duplicate names case-insensitively, ignoring the edited row', () => {
    const domains = [
      { name: 'Test', url: 'https://a.ee/' },
      { name: 'Other', url: 'https://b.ee/' },
    ];
    expect(hasDuplicateName(domains, 'test', 1)).toBe(true);
    expect(hasDuplicateName(domains, 'Other', 0)).toBe(true);
    expect(hasDuplicateName(domains, 'Test', 0)).toBe(false);
    expect(hasDuplicateName(domains, 'New', 1)).toBe(false);
  });

  it('detects duplicate urls ignoring trailing slash and case', () => {
    const domains = [
      { name: 'A', url: 'https://a.ee' },
      { name: 'B', url: 'https://b.ee/' },
    ];
    expect(hasDuplicateUrl(domains, 'https://A.ee/', 1)).toBe(true);
    expect(hasDuplicateUrl(domains, 'https://b.ee', 0)).toBe(true);
    expect(hasDuplicateUrl(domains, 'https://b.ee/', 1)).toBe(false);
  });

  it('normalizes urls with a trailing slash', () => {
    expect(normalizeUrl('https://a.ee')).toBe('https://a.ee/');
    expect(normalizeUrl('https://a.ee/')).toBe('https://a.ee/');
  });
});
