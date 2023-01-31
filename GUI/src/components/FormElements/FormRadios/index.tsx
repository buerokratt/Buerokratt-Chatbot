import { FC, useId } from 'react';

import './FormRadios.scss';

type FormRadiosType = {
  label: string;
  name: string;
  hideLabel?: boolean;
  items: {
    label: string;
    value: string;
  }[];
}

const FormRadios: FC<FormRadiosType> = ({ label, name, hideLabel, items }) => {
  const id = useId();

  return (
    <div className='radios' role='group'>
      {label && !hideLabel && <label className='radios__label'>{label}</label>}
      <div className='radios__wrapper'>
        {items.map((item, index) => (
          <div key={`${item.value}-${index}`} className='radios__item'>
            <input type='radio' name={name} id={`${id}-${item.value}`} value={item.value} />
            <label htmlFor={`${id}-${item.value}`}>{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormRadios;
