import { FC, HTMLAttributes, PropsWithChildren } from 'react';

type TrackProps = HTMLAttributes<HTMLDivElement> & {
  gap?: number;
  align?: 'left' | 'center' | 'right' | 'stretch';
  justify?: 'start' | 'between' | 'center' | 'around' | 'end';
  direction?: 'horizontal' | 'vertical';
  isMultiline?: boolean;
}

const alignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
  stretch: 'stretch',
};

const justifyMap = {
  start: 'flex-start',
  between: 'space-between',
  center: 'center',
  around: 'space-around',
  end: 'flex-end',
};

const Track: FC<PropsWithChildren<TrackProps>> = (
  {
    gap = 0,
    align = 'center',
    justify = 'start',
    direction = 'horizontal',
    isMultiline = false,
    children,
    style,
    ...rest
  },
) => {
  return (
    <div
      className='track'
      style={{
        display: 'flex',
        gap,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        flexWrap: isMultiline ? 'wrap' : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Track;
