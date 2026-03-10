import clsx from 'clsx';
import { forwardRef, InputHTMLAttributes, PropsWithChildren, useId } from 'react';

import './FormInput.scss';
import { CHAT_INPUT_LENGTH } from 'constants/config';

type InputProps = PropsWithChildren<InputHTMLAttributes<HTMLInputElement>> & {
  label: string;
  name: string;
  hideLabel?: boolean;
  maxLength?: number;
  className?: string;
  labelWidth?: number;
};

const FieldInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, disabled, hideLabel, maxLength, className, labelWidth, children, ...rest }, ref) => {
    const id = useId();

    const isGrid = typeof labelWidth === 'number';

    const inputClasses = clsx('input', disabled && 'input--disabled');

    return (
      <div
        className={`${inputClasses} ${className}`}
        style={isGrid ? { display: 'grid', gridTemplateColumns: `${labelWidth}px 1fr`, alignItems: 'left' } : undefined}
      >
        {label && !hideLabel && (
          <label htmlFor={id} className="input__label" style={isGrid ? { paddingRight: 8 } : undefined}>
            {label}
          </label>
        )}
        <div className="input__wrapper">
          <input
            className={inputClasses}
            name={name}
            maxLength={CHAT_INPUT_LENGTH}
            id={id}
            ref={ref}
            aria-label={hideLabel ? label : undefined}
            {...rest}
          />
          {children}
        </div>
      </div>
    );
  },
);

export default FieldInput;
