import { forwardRef, useId } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { ControllerRenderProps } from 'react-hook-form';

import './SwitchBox.scss';

type SwitchBoxProps = Partial<ControllerRenderProps> & {
  name?: string;
  label: string;
  checked?: boolean;
  hideLabel?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const SwitchBox = forwardRef<HTMLButtonElement, SwitchBoxProps>((
  {
    name,
    label,
    checked,
    hideLabel,
    onCheckedChange,
  },
  ref,
) => {
  const id = useId();

  return (
    <div className='switchbox'>
      {label && !hideLabel && <label htmlFor={id} className='switch__label'>{label}</label>}
      <RadixSwitch.Root
        ref={ref}
        id={id}
        name={name}
        className='switchbox__button'
        onCheckedChange={onCheckedChange}
        defaultChecked={checked}
      >
        <RadixSwitch.Thumb className='switchbox__thumb' />
      </RadixSwitch.Root>
    </div>
  );
});

export default SwitchBox;
