import { ChangeEvent, FC, useId, useState } from 'react';

import './FormCheckboxes.scss';

type FormCheckboxesType = {
  label: string;
  name: string;
  hideLabel?: boolean;
  onValuesChange?: (values: Record<string, any>) => void;
  items: {
    label: string;
    value: string;
  }[];
}

const FormCheckboxes: FC<FormCheckboxesType> = ({ label, name, hideLabel, onValuesChange, items }) => {
  const id = useId();
  const [selectedValues, setSelectedValues] = useState<Record<string, any>>({});

  const handleValuesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [e.target.name]: [e.target.value],
    }));
    if (onValuesChange) onValuesChange(selectedValues);
  };

  return (
    <fieldset className='checkboxes' role='group'>
      {label && !hideLabel && <label className='checkboxes__label'>{label}</label>}
      <div className='checkboxes__wrapper'>
        {items.map((item, index) => (
          <div key={`${item.value}-${index}`} className='checkboxes__item'>
            <input type='checkbox' name={name} id={`${id}-${item.value}`} value={item.value}
                   onChange={handleValuesChange} />
            <label htmlFor={`${id}-${item.value}`}>{item.label}</label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default FormCheckboxes;
