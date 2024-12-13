import { ChangeEvent, forwardRef, useId, useState } from 'react';
import clsx from 'clsx';
import { createRegexRenderer, RichTextarea, RichTextareaProps } from 'rich-textarea';
import './RichTextArea.scss';

type RichTextAreaProps = RichTextareaProps & {
  label: string;
  name: string;
  hideLabel?: boolean;
  showMaxLength?: boolean;
  maxLengthBottom?: boolean;
};

const RichTextArea = forwardRef<HTMLTextAreaElement, RichTextAreaProps>(
  (
    {
      label,
      maxLength = 2000,
      disabled,
      hideLabel,
      showMaxLength,
      maxLengthBottom,
      defaultValue,
      onChange
    },
    ref
  ) => {
    const id = useId();
    const [currentLength, setCurrentLength] = useState(
      (typeof defaultValue === 'string' && defaultValue.length) || 0
    );

    const textareaClasses = clsx(
      'textarea',
      disabled && 'textarea--disabled',
      showMaxLength && 'textarea--maxlength-shown'
    );

    const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (showMaxLength) {
        setCurrentLength(e.target.value.length);
      }
    };

    return (
      <div className={textareaClasses}>
        {label && !hideLabel && (
          <label htmlFor={id} className="textarea__label">
            {label}
          </label>
        )}
        <div className="textarea__wrapper">
          <RichTextarea
            id={id}
            style={{ width: '100%', height: '90px' }}
            maxLength={maxLength}
            ref={ref}
            defaultValue={defaultValue ?? ''}
            aria-label={hideLabel ? label : undefined}
            onChange={(e) => {
              if (onChange) onChange(e);
              handleOnChange(e);
            }}
          >
            {createRegexRenderer([
              [
                /https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g,
                ({ children, key, value }) => (
                  <a
                    style={{
                      color: 'blue',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                    key={key}
                    href={value}
                    target="_blank"
                  >
                    {children}
                  </a>
                ),
              ],
            ])}
          </RichTextarea>
          {showMaxLength && (
            <div
              className={
                maxLengthBottom
                  ? 'textarea__max-length-bottom'
                  : 'textarea__max-length-top'
              }
            >
              {currentLength}/{maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default RichTextArea;
