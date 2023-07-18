import { forwardRef, InputHTMLAttributes, useId } from 'react';
import clsx from 'clsx';
import { MdOutlinePalette } from 'react-icons/md';

import { Icon } from 'components';
import './FormInput.scss';
import { CHAT_INPUT_LENGTH } from 'constants/config';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hideLabel?: boolean;
  colorInput?: boolean;
  maxLength?: number;
};

const FieldInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, name, disabled, hideLabel, colorInput, maxLength, ...rest },
    ref
  ) => {
    const id = useId();

    const inputClasses = clsx('input', disabled && 'input--disabled');

    return (
      <div className={inputClasses}>
        {label && !hideLabel && (
          <label htmlFor={id} className="input__label">
            {label}
          </label>
        )}
        <div className="input__wrapper">
          <input
            className={inputClasses}
            name={name}
            // placeholder={placeholderr}
            maxLength={CHAT_INPUT_LENGTH}
            id={id}
            ref={ref}
            aria-label={hideLabel ? label : undefined}
            pattern={colorInput ? '^#([a-fA-F0-9]{3}){1,2}$' : undefined}
            {...rest}
          />
          {colorInput && (
            <Icon
              icon={<MdOutlinePalette fontSize={20} color="rgba(0,0,0,0.54)" />}
            />
          )}
        </div>
      </div>
    );
  }
);

export default FieldInput;
