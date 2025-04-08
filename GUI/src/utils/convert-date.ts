export const dateToLocalExcludingDST = (dateAsString?: Date | string): Date => {
  const date = dateAsString ? new Date(dateAsString) : new Date();
  const offsetDiff = getDSTOffsetDiffInMinutes(date);

  if (offsetDiff !== 0) date.setMinutes(date.getMinutes() + offsetDiff);

  return date;
};

export const dateToUTCExcludingDST = (localDate: Date | string): string => {
  const date = new Date(localDate);
  const offsetDiffMinutes = getDSTOffsetDiffInMinutes(date);

  const adjustedDate = new Date(date.getTime() - offsetDiffMinutes * 60 * 1000);
  return adjustedDate.toISOString();
};

const getDSTOffsetDiffInMinutes = (date: Date): number => {
  const janOffset = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const julOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  const standardOffset = Math.max(janOffset, julOffset);

  const currentOffset = date.getTimezoneOffset();

  return currentOffset - standardOffset;
};
