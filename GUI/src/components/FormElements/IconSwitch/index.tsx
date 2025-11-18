import { forwardRef, ReactNode, useId } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { MdOutlineCheck } from 'react-icons/md';

import './IconSwitch.scss';

type IconSwitchProps = {
  name?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  hideLabel?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  offIcon?: ReactNode;
};

const IconSwitch = forwardRef<HTMLButtonElement, IconSwitchProps>(
  (
    {
      name,
      label,
      checked,
      defaultChecked,
      onCheckedChange,
      hideLabel,
      disabled,
      icon,
      offIcon
    },
    ref
  ) => {
    const id = useId();
    const activeIcon = icon !== undefined ? icon : <MdOutlineCheck className="icon-switch__checkmark" />;

    return (
      <div className="icon-switch">
        {label && !hideLabel && (
          <label htmlFor={id} className="icon-switch__label">
            {label}
          </label>
        )}
        <RadixSwitch.Root
          ref={ref}
          id={id}
          className="icon-switch__button"
          name={name}
          onCheckedChange={onCheckedChange}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
        >
          <RadixSwitch.Thumb className="icon-switch__thumb">
            {offIcon && <span className="icon-switch__off-icon">{offIcon}</span>}
            <span className="icon-switch__on-icon">{activeIcon}</span>
          </RadixSwitch.Thumb>
        </RadixSwitch.Root>
      </div>
    );
  }
);

IconSwitch.displayName = 'IconSwitch';

export default IconSwitch;

