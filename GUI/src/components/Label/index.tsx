import { forwardRef, PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';
import { MdOutlineCheck } from 'react-icons/md';

import { Tooltip } from 'components';
import './Label.scss';

type LabelProps = {
  type?: 'warning' | 'error' | 'info' | 'success';
  tooltip?: ReactNode;
}

const Label = forwardRef<HTMLSpanElement, PropsWithChildren<LabelProps>>((
  {
    type = 'info',
    tooltip,
    children,
  }, ref,
) => {
  const labelClasses = clsx(
    'label',
    `label--${type}`,
    tooltip && 'label--tooltip',
  );

  return (
    <span ref={ref} className={labelClasses}>
      {children}
      {tooltip && (
        <Tooltip content={tooltip}>
          <span className='label__icon'>
            {type === 'success' ? <MdOutlineCheck /> : 'i'}
          </span>
        </Tooltip>
      )}
    </span>
  );
});

export default Label;
