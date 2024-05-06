export const getFromLocalStorage = (
  key: string,
  initialValue: any = null
): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch {
    return initialValue;
  }
};

export const setToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
