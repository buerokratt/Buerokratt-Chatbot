import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

import './FormInput.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hideLabel?: boolean;
};

const FieldInput = forwardRef<HTMLInputElement, InputProps>(({ label, name, disabled, hideLabel, ...rest }, ref) => {
  const inputClasses = clsx(
    'input',
    disabled && 'input--disabled',
  );

  return (
    <div className={inputClasses}>
      {label && !hideLabel && <label htmlFor={name} className='input__label'>{label}</label>}
      <div className='input__wrapper'>
        <input className={inputClasses} name={name} id={name} ref={ref} {...rest} />
      </div>
    </div>
  );
});

export default FieldInput;
