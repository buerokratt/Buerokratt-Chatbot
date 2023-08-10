import { FC, InputHTMLAttributes, useEffect, useState } from 'react';
import './DeboucedInput.scss';
import SearchIcon from './CloseIcon';
import CloseIcon from './CloseIcon';

type DebouncedInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  value: string | number;
  onChange: (value: string | number) => void;
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
        <i onClick={() => setValue('')}>
          <CloseIcon />
        </i>
      )}
    </div>
  );
};

export default DebouncedInput;
