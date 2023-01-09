import { FC, useId } from 'react';

import './FormCheckbox.scss';

type FormCheckboxType = {
  label: string;
  name: string;
  hideLabel?: boolean;
  item: {
    label: string;
    value: string;
  };
}

const FormCheckbox: FC<FormCheckboxType> = ({ label, name, hideLabel, item }) => {
  const uid = useId();

  return (
    <div className='checkbox'>
      {label && !hideLabel && <label className='checkbox__label'>{label}</label>}
      <div className='checkbox__item'>
        <input type='checkbox' name={name} id={uid} value={item.value} />
        <label htmlFor={uid}>{item.label}</label>
      </div>
    </div>
  );
};

export default FormCheckbox;
