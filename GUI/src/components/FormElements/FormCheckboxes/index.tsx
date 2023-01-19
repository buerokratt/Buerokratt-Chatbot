import { FC, useId } from 'react';

import './FormCheckboxes.scss';

type FormCheckboxesType = {
  label: string;
  name: string;
  hideLabel?: boolean;
  items: {
    label: string;
    value: string;
  }[];
}

const FormCheckboxes: FC<FormCheckboxesType> = ({ label, name, hideLabel, items }) => {
  const id = useId();

  return (
    <div className='checkboxes' role='group'>
      {label && !hideLabel && <label className='checkboxes__label'>{label}</label>}
      <div className='checkboxes__wrapper'>
        {items.map((item, index) => (
          <div key={`${item.value}-${index}`} className='checkboxes__item'>
            <input type='checkbox' name={name} id={`${id}-${item.value}`} value={item.value} />
            <label htmlFor={`${id}-${item.value}`}>{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormCheckboxes;
