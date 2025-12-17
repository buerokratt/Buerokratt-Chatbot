import { forwardRef, InputHTMLAttributes, useId } from 'react';

import './FormCheckbox.scss';

type FormCheckboxType = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  name?: string;
  hideLabel?: boolean;
  isInverted?: boolean;
  item: {
    label: string;
    value: string;
    checked?: boolean;
  };
};

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxType>(
  ({ label, name, hideLabel, isInverted, item, ...rest }, ref) => {
    const uid = useId();

    return (
      <div className={`checkbox ${isInverted ? 'checkbox--inverted' : ''}`}>
        {label && !hideLabel && <label className="checkbox__label">{label}</label>}
        <label htmlFor={uid} className="checkbox__item">
          <input
            ref={ref}
            type="checkbox"
            name={name}
            id={uid}
            value={item.value}
            defaultChecked={item.checked}
            {...rest}
          />
          <span>{item.label}</span>
        </label>
      </div>
    );
  },
);

export default FormCheckbox;
