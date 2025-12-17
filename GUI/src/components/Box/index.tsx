import clsx from 'clsx';
import { forwardRef, PropsWithChildren } from 'react';

import './Box.scss';

type BoxProps = {
  color?: 'default' | 'blue' | 'yellow' | 'green' | 'red' | 'gray' | 'dark-blue' | 'orange';
};

const Box = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>(({ color = 'default', children }, ref) => {
  return (
    <div ref={ref} className={clsx(['box', `box--${color}`])}>
      {children}
    </div>
  );
});

export default Box;
