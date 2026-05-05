import { FC, useEffect, useRef, useState } from 'react';
import { getWidgetData } from '../../services/users';
import useStore from '../../store';
import { DomainSelection } from '../../types/domainsModels';
import './DomainTabSelector.scss';

type SelectOption = { label: string; value: string; meta?: string };

type DomainTabSelectorProps = {
  readonly onChange?: (selected: SelectOption[]) => void;
};

const DomainTabSelector: FC<DomainTabSelectorProps> = ({ onChange }) => {
  const idCode = useStore((state) => state.userInfo?.idCode);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [activeValue, setActiveValue] = useState<string | null>(null);

  useEffect(() => {
    if (!idCode) return;

    const fetchDomains = async () => {
      try {
        const data: DomainSelection[] = await getWidgetData(idCode);
        const opts = data.map((d) => ({ label: d.name, value: d.id, meta: d.url }));
        setOptions(opts);
        if (opts.length > 0) {
          setActiveValue(opts[0].value);
          onChangeRef.current?.([opts[0]]);
        }
      } catch (error) {
        console.error('Failed to fetch widget data', error);
      }
    };

    fetchDomains();
  }, [idCode]);

  const handleClick = (option: SelectOption) => {
    setActiveValue(option.value);
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
