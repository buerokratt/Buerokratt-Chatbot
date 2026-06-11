import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useStore from '../../store';
import { DomainSelection } from '../../types/domainsModels';
import { FormMultiselect } from '../FormElements';

type DomainSelector = {
  onChange?: (selected: SelectOption[]) => void;
};

import { SelectOption } from 'types/selectOption';

const DomainSelector: FC<PropsWithChildren<DomainSelector>> = ({ onChange }) => {
  const { t } = useTranslation();

  const allDomains = useStore((state) => state.allDomains);

  const [renderVersion, setRenderVersion] = useState(0);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
  const reflectDomains = import.meta.env.REACT_APP_REFLECT_DOMAINS?.toLowerCase() === 'true';

  function mapDomainSelections(domains: DomainSelection[]): {
    options: SelectOption[];
    selectedOptions: SelectOption[];
  } {
    const opts = domains.map((d) => ({ label: d.name, value: d.id, meta: d.url }));
    const selected = opts.filter((opt) => domains.find((d) => d.id === opt.value && d.selected));
    return { options: opts, selectedOptions: selected };
  }

  useEffect(() => {
    if (!allDomains.length) return;
    const { options, selectedOptions } = mapDomainSelections(allDomains);
    setOptions(options);
    setSelectedOptions(selectedOptions);
    setRenderVersion((prev) => prev + 1);
  }, [allDomains]);

  return (
    <div style={{ width: '500px' }}>
      <div className="multiSelect">
        <div className="multiSelect_wrapper">
          <FormMultiselect
            name={name}
            label={t('multiDomains.selectDomains')}
            key={renderVersion}
            mode={'static'}
            required={false}
            selectedOptions={reflectDomains ? selectedOptions || [] : []}
            options={options || []}
            isMulti={true}
            placeholder={t('global.choose')}
            onSelectionChange={(val) => {
              setSelectedOptions(val);
              if (onChange) onChange(val);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DomainSelector;
