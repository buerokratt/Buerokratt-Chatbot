import { FC, InputHTMLAttributes, useId } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { useTranslation } from 'react-i18next';

import './Switch.scss';

type SwitchProps = InputHTMLAttributes<HTMLInputElement> & {
  onLabel?: string;
  offLabel?: string;
  name: string;
  label: string;
  hideLabel?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch: FC<SwitchProps> = (
  {
    onLabel,
    offLabel,
    label,
    hideLabel,
    defaultChecked,
    onCheckedChange,
  },
) => {
  const id = useId();
  const { t } = useTranslation();
  const onValueLabel = onLabel || t('global.on');
  const offValueLabel = offLabel || t('global.off');

  return (
    <div className='switch'>
      {label && !hideLabel && <label htmlFor={id} className='switch__label'>{label}</label>}
      <RadixSwitch.Root
        id={id}
        className='switch__button'
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
      >
        <RadixSwitch.Thumb className='switch__thumb' />
        <span className='switch__on'>{onValueLabel}</span>
        <span className='switch__off'>{offValueLabel}</span>
      </RadixSwitch.Root>
    </div>
  );
};

export default Switch;
