import { ButtonHTMLAttributes, FC, PropsWithChildren, useRef } from 'react';
import clsx from 'clsx';

import './Button.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: 'primary' | 'secondary' | 'text' | 'icon' | 'error' | 'success';
  size?: 'm' | 's';
};

const Button: FC<PropsWithChildren<ButtonProps>> = (
  {
    appearance = 'primary',
    size = 'm',
    disabled,
    children,
    ...rest
  },
) => {
  const ref = useRef<HTMLButtonElement>(null);

  const buttonClasses = clsx(
    'btn',
    `btn--${appearance}`,
    `btn--${size}`,
    disabled && 'btn--disabled',
  );

  return (
    <button className={buttonClasses} ref={ref} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
