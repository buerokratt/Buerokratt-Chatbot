export const isBlankInput = (value: string | undefined | null): boolean => {
  return !value || value.trim().length === 0;
};

export const valueOutOfRange = (inputValue: string, minValue: number, maxValue: number): boolean => {
  const value = parseInt(inputValue, 10);
  if (Number.isNaN(value)) {
    return false;
  }
  return value < minValue || value > maxValue;
};
