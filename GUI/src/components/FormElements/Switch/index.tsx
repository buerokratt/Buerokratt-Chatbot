import { forwardRef, useId } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { useTranslation } from 'react-i18next';
import { ControllerRenderProps } from 'react-hook-form';

import './Switch.scss';

type SwitchProps = Partial<ControllerRenderProps> & {
  onLabel?: string;
  offLabel?: string;
  onColor?: string;
  name: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  hideLabel?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>((
  {
    onLabel,
    offLabel,
    onColor,
    label,
    checked,
    hideLabel,
    onCheckedChange,
    defaultChecked
  },
  ref,
) => {
  const id = useId();
  const { t } = useTranslation();
  const onValueLabel = onLabel || t('global.on');
  const offValueLabel = offLabel || t('global.off');

  return (
    <div className='switch' style={{[`${'--active-color'}`]: onColor}}>
      {label && !hideLabel && <label htmlFor={id} className='switch__label'>{label}</label>}
      <RadixSwitch.Root
        ref={ref}
        id={id}
        className='switch__button'
        onCheckedChange={onCheckedChange}
        checked={checked}
        defaultChecked={defaultChecked}
      >
        <RadixSwitch.Thumb className='switch__thumb' />
        <span className='switch__on'>{onValueLabel}</span>
        <span className='switch__off'>{offValueLabel}</span>
      </RadixSwitch.Root>
    </div>
  );
});

export default Switch;
