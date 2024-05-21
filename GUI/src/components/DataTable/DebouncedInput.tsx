import { FC, InputHTMLAttributes, useEffect, useState } from 'react';
import './DeboucedInput.scss';
import CloseIcon from './CloseIcon';

type DebouncedInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  value: string | number | string[];
  onChange: (value: string | number | string[]) => void;
  debounce?: number;
};

const DebouncedInput: FC<DebouncedInputProps> = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="input-container">
      <input
        style={{ paddingRight: '30px' }}
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          style={{ position: 'absolute', right: '0px', bottom: '15px' }}
          onClick={() => setValue('')}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default DebouncedInput;
