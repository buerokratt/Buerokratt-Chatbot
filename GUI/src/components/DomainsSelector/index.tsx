import { FC, PropsWithChildren, useEffect, useState } from 'react';

import useStore from '../../store';
import { DomainSelection } from '../../types/domainsModels';
import { getWidgetData } from '../../services/users';
import { FormMultiselect } from '../FormElements';
import { useTranslation } from 'react-i18next';

type DomainSelector = {
  onChange?: (selected: SelectOption[]) => void;
};

type SelectOption = { label: string; value: string; meta?: string };

const DomainSelector: FC<PropsWithChildren<DomainSelector>> = ({
  onChange
}) => {
  const { t } = useTranslation();

  const userInfo = useStore((state) => state.userInfo);

  const [renderVersion, setRenderVersion] = useState(0);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);

  function mapDomainSelections(domains: DomainSelection[]): {
    options: SelectOption[];
    selectedOptions: SelectOption[];
  } {
    const options = domains.map((d) => ({
      label: d.name,
      value: d.id,
      meta: d.url,
    }));

    const selectedOptions = options.filter((opt) =>
      domains.find((d) => {
        return d.id === opt.value && d.selected;
      })
    );

    return { options, selectedOptions };
  }

  useEffect(() => {
    if (!userInfo?.idCode) return;

    const fetchData = async () => {
      try {
        const data = await getWidgetData(userInfo.idCode);
        const { options, selectedOptions } = mapDomainSelections(data);
        setOptions(options);
        setSelectedOptions(selectedOptions);
        setRenderVersion((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to fetch widget data', error);
      }
    };

    fetchData();
  }, [userInfo?.idCode]);

  return (
    <div style={{ width: '500px' }}>
      <div className="multiSelect">
        <div className="multiSelect_wrapper">
          <FormMultiselect
            name={name}
            label={'Select domains'}
            key={renderVersion}
            mode={'static'}
            required={false}
            selectedOptions={selectedOptions || []}
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
