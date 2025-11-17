import clsx from 'clsx';
import React, { ButtonHTMLAttributes, FC, PropsWithChildren, useRef } from 'react';

import './Button.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: 'primary' | 'secondary' | 'text' | 'icon' | 'error' | 'success' | 'loading';
  size?: 'm' | 's';
  disabledWithoutStyle?: boolean;
  className?: string;
};

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  appearance = 'primary',
  size = 'm',
  disabled,
  disabledWithoutStyle = false,
  children,
  className,
  ...rest
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  const buttonClasses = clsx('btn', `btn--${appearance}`, `btn--${size}`, disabled && 'btn--disabled', className);
  const isDisabled: boolean = disabled || appearance === 'loading';
  return (
    <button className={buttonClasses} ref={ref} disabled={isDisabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
