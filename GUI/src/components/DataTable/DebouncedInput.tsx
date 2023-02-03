import { FC, InputHTMLAttributes, useEffect, useRef, useState } from 'react';

type DebouncedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
}

const DebouncedInput: FC<DebouncedInputProps> = (
  {
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
  },
) => {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
    ref.current?.focus();
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input {...props} ref={ref} value={value} onChange={e => setValue(e.target.value)} />
  );
};

export default DebouncedInput;
