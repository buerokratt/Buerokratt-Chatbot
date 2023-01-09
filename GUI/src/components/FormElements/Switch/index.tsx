import { FC, InputHTMLAttributes } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { useTranslation } from 'react-i18next';

import './Switch.scss';

type SwitchProps = InputHTMLAttributes<HTMLInputElement> & {
  onLabel?: string;
  offLabel?: string;
  name: string;
  label: string;
  hideLabel?: boolean;
}

const Switch: FC<SwitchProps> = ({ onLabel, offLabel, name, label, hideLabel, defaultChecked }) => {
  const { t } = useTranslation();
  const onValueLabel = onLabel || t('global.on');
  const offValueLabel = offLabel || t('global.off');

  return (
    <div className='switch'>
      {label && !hideLabel && <label htmlFor={name} className='switch__label'>{label}</label>}
      <RadixSwitch.Root id={name} className='switch__button' defaultChecked={defaultChecked}>
        <RadixSwitch.Thumb className='switch__thumb' />
        <span className='switch__on'>{onValueLabel}</span>
        <span className='switch__off'>{offValueLabel}</span>
      </RadixSwitch.Root>
    </div>
  );
};

export default Switch;
