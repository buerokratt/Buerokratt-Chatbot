import * as RadixSwitch from '@radix-ui/react-switch';
import { forwardRef, ReactNode, useId } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import './Switch.scss';

type SwitchProps = Partial<ControllerRenderProps> & {
  onLabel?: string | React.ReactNode;
  offLabel?: string | React.ReactNode;
  onColor?: string;
  name?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  hideLabel?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  tooltip?: ReactNode;
};

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ onLabel, offLabel, onColor, name, label, checked, hideLabel, onCheckedChange, defaultChecked, tooltip }, ref) => {
    const id = useId();
    const { t } = useTranslation();
    const onValueLabel = onLabel || t('global.on');
    const offValueLabel = offLabel || t('global.off');

    return (
      <div className="switch" style={{ [`${'--active-color'}`]: onColor }}>
        {label && !hideLabel && (
          <label htmlFor={id} className="switch__label">
            {label}
          </label>
        )}
        <RadixSwitch.Root
          ref={ref}
          id={id}
          className="switch__button"
          name={name}
          onCheckedChange={onCheckedChange}
          checked={checked}
          defaultChecked={defaultChecked}
        >
          <RadixSwitch.Thumb className="switch__thumb" />
          <span className="switch__on">{onValueLabel}</span>
          <span className="switch__off">{offValueLabel}</span>
        </RadixSwitch.Root>
        {tooltip && <span className="switch__tooltip">{tooltip}</span>}
      </div>
    );
  },
);

export default Switch;
