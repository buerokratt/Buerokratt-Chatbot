import { forwardRef, InputHTMLAttributes, useId } from 'react';
import clsx from 'clsx';

import './FormInput.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hideLabel?: boolean;
};

const FieldInput = forwardRef<HTMLInputElement, InputProps>(({ label, name, disabled, hideLabel, ...rest }, ref) => {
  const id = useId();

  const inputClasses = clsx(
    'input',
    disabled && 'input--disabled',
  );

  return (
    <div className={inputClasses}>
      {label && !hideLabel && <label htmlFor={id} className='input__label'>{label}</label>}
      <div className='input__wrapper'>
        <input
          className={inputClasses}
          name={name}
          id={id}
          ref={ref}
          aria-label={hideLabel ? label : undefined}
          {...rest}
        />
      </div>
    </div>
  );
});

export default FieldInput;
