import { useCallback } from 'react';

type SelectOption = { label: string; value: string; meta?: string };

export const useDomainSelectionHandler = (
  setSelectedDomains: (ids: string[]) => void,
  fetchData: (domainId: string) => void,
  resetSettingsToDefault: () => void
) => {
  const mapDomainSelection = useCallback((selectedDomains: SelectOption[]) => {
    if (!selectedDomains || selectedDomains.length === 0) return [];
    return selectedDomains.map((so) => so.value);
  }, []);

  const handleDomainSelection = useCallback(
    (selection: SelectOption[]): void => {
      const domainSelection = mapDomainSelection(selection);

      setSelectedDomains(domainSelection);

      if (domainSelection.length === 1) {
        fetchData(domainSelection[0]);
      } else {
        resetSettingsToDefault();
      }
    },
    [fetchData, resetSettingsToDefault, setSelectedDomains, mapDomainSelection]
  );

  return handleDomainSelection;
};
