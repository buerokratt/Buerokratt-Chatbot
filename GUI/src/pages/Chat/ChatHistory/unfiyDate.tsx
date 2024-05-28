export const unifyDateFromat = (originalDate: string): Date | string => {
  const parts = originalDate.split('-');
  if(parts.length !== 3)
    return originalDate;
  const [year, month, day] = parts.map(Number);
  return new Date(year, month - 1, day);
}
