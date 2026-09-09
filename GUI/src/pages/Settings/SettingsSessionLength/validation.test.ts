import { describe, expect, it } from 'vitest';

import { isBlankInput, valueOutOfRange } from './validation';

describe('SettingsSessionLength validation', () => {
  it('treats whitespace-only input as blank so it cannot be saved', () => {
    expect(isBlankInput('   ')).toBe(true);
    expect(isBlankInput('')).toBe(true);
    expect(isBlankInput(undefined)).toBe(true);
    expect(isBlankInput('30')).toBe(false);
  });

  it('rejects out-of-range values the same way as before', () => {
    expect(valueOutOfRange('29', 30, 480)).toBe(true);
    expect(valueOutOfRange('481', 30, 480)).toBe(true);
    expect(valueOutOfRange('30', 30, 480)).toBe(false);
    expect(valueOutOfRange('480', 30, 480)).toBe(false);
  });
});
