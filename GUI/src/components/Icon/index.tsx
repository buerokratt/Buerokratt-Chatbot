import { CSSProperties, forwardRef, ReactNode, StyleHTMLAttributes } from 'react';
import * as AccessibleIcon from '@radix-ui/react-accessible-icon';
import clsx from 'clsx';

import './Icon.scss';

type IconProps = StyleHTMLAttributes<CSSProperties> & {
  label?: string | null;
  icon: ReactNode;
  size?: 'small' | 'medium';
};

const Icon = forwardRef<HTMLSpanElement, IconProps>(({ label, icon, size = 'small', ...rest }, ref) => {
  const iconClasses = clsx(
    'icon',
    `icon--${size}`,
  );

  return (
    <AccessibleIcon.Root label={label ?? ''}>
      <span ref={ref} className={iconClasses} style={rest.style}>{icon}</span>
    </AccessibleIcon.Root>
  );
});

export default Icon;
