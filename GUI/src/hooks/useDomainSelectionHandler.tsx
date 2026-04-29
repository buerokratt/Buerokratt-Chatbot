import { useCallback, useRef } from 'react';

type SelectOption = { label: string; value: string; meta?: string };

export const useDomainSelectionHandler = (
  setSelectedDomains: (ids: string[]) => void,
  fetchData: (domainId: string) => void,
  resetSettingsToDefault: () => void,
) => {
  const fetchDataRef = useRef(fetchData);
  const resetRef = useRef(resetSettingsToDefault);
  fetchDataRef.current = fetchData;
  resetRef.current = resetSettingsToDefault;

  const mapDomainSelection = useCallback((selectedDomains: SelectOption[]) => {
    if (!selectedDomains || selectedDomains.length === 0) return [];
    return selectedDomains.map((so) => so.value);
  }, []);

  const handleDomainSelection = useCallback(
    (selection: SelectOption[]): void => {
      const domainSelection = mapDomainSelection(selection);

      setSelectedDomains(domainSelection);

      if (domainSelection.length === 1) {
        fetchDataRef.current(domainSelection[0]);
      } else {
        resetRef.current();
      }
    },
    [setSelectedDomains, mapDomainSelection],
  );

  return handleDomainSelection;
};
