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
    const safeValue = Number.isFinite(numValue) ? numValue : numMin;
    const percent = numMax > numMin ? ((safeValue - numMin) / (numMax - numMin)) * 100 : 0;

    const inputCssVars: React.CSSProperties = {
      ...(color != null && color !== '' ? { ['--slider-color' as string]: color } : {}),
      ['--slider-thumb-size' as string]: thumbSize == null ? undefined : `${thumbSize}px`,
      ['--slider-track-height' as string]: trackHeight == null ? undefined : `${trackHeight}px`,
      ['--value-percent' as string]: `${percent}%`,
    };

    return (
      <div className="slider" style={{ ...wrapperStyle, ...style }}>
        <input
          ref={ref}
          type="range"
          className="slider__input"
          style={inputCssVars}
          value={value}
          min={min}
          max={max}
          {...rest}
        />
      </div>
    );
  },
);

export default Slider;
