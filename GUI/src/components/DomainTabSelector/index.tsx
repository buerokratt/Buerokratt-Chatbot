import { FC, useEffect, useRef, useState } from 'react';
import useStore from '../../store';
import './DomainTabSelector.scss';

import { SelectOption } from 'types/selectOption';

type DomainTabSelectorProps = {
  readonly onChange?: (selected: SelectOption[]) => void;
};

const DomainTabSelector: FC<DomainTabSelectorProps> = ({ onChange }) => {
  const allDomains = useStore((state) => state.allDomains);
  const selectedDomainId = useStore((state) => state.selectedDomainId);
  const setSelectedDomainId = useStore((state) => state.setSelectedDomainId);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [activeValue, setActiveValue] = useState<string | null>(selectedDomainId);

  useEffect(() => {
    if (!allDomains.length) return;
    const opts = allDomains.map((d) => ({ label: d.name, value: d.id, meta: d.url }));
    setOptions(opts);
    const restoredOpt = opts.find((o) => o.value === selectedDomainId) ?? opts[0];
    setActiveValue(restoredOpt.value);
    setSelectedDomainId(restoredOpt.value);
    onChangeRef.current?.([restoredOpt]);
  }, [allDomains]);

  const handleClick = (option: SelectOption) => {
    setActiveValue(option.value);
    setSelectedDomainId(option.value);
    onChangeRef.current?.([option]);
  };

  return (
    <div className="domain-tab-selector">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`domain-tab-selector__tab${activeValue === option.value ? ' domain-tab-selector__tab--active' : ''}`}
          onClick={() => handleClick(option)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default DomainTabSelector;
