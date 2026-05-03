import { forwardRef, InputHTMLAttributes } from 'react';
import './Slider.scss';

type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  color?: string;
  thumbSize?: number;
  trackHeight?: number;
  wrapperStyle?: React.CSSProperties;
};

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ color, thumbSize, trackHeight, style, wrapperStyle, value, min = 0, max = 100, ...rest }, ref) => {
    const numValue = Number(value ?? min);
    const numMin = Number(min);
    const numMax = Number(max);
    const percent = numMax > numMin ? ((numValue - numMin) / (numMax - numMin)) * 100 : 0;

    return (
      <div
        className="slider"
        style={{
          ['--slider-color' as string]: color,
          ['--slider-thumb-size' as string]: thumbSize == null ? undefined : `${thumbSize}px`,
          ['--slider-track-height' as string]: trackHeight == null ? undefined : `${trackHeight}px`,
          ['--value-percent' as string]: `${percent}%`,
          ...wrapperStyle,
          ...style,
        }}
      >
        <input ref={ref} type="range" className="slider__input" value={value} min={min} max={max} {...rest} />
      </div>
    );
  },
);

export default Slider;
