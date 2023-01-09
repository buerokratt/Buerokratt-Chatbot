import { forwardRef, useState } from 'react';
import TextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize';
import clsx from 'clsx';

import './FormTextarea.scss';

type TextareaProps = TextareaAutosizeProps & {
  label: string;
  name: string;
  hideLabel?: boolean;
  showMaxLength?: boolean;
};

const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
  {
    label,
    name,
    maxLength = 2000,
    minRows = 3,
    maxRows = 3,
    disabled,
    hideLabel,
    showMaxLength,
    defaultValue,
    ...rest
  },
  ref,
) => {
  const [currentLength, setCurrentLength] = useState(typeof defaultValue === 'string' && defaultValue.length || 0);
  const textareaClasses = clsx(
    'textarea',
    disabled && 'textarea--disabled',
    showMaxLength && 'textarea--maxlength-shown',
  );

  return (
    <div className={textareaClasses}>
      {label && !hideLabel && <label htmlFor={name} className='textarea__label'>{label}</label>}
      <div className='textarea__wrapper'>
        <TextareaAutosize
          onChange={showMaxLength ? (e) => setCurrentLength(e.target.value.length) : undefined}
          maxLength={maxLength} minRows={minRows}
          maxRows={maxRows}
          ref={ref}
          defaultValue={defaultValue}
          {...rest}
        />
        {showMaxLength && (
          <div className='textarea__max-length'>{currentLength}/{maxLength}</div>
        )}
      </div>
    </div>
  );
});

export default FormTextarea;
