import {ChangeEvent, forwardRef, useEffect, useId, useState} from 'react';
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize';
import {
  createRegexRenderer,
  RichTextarea,
  RichTextareaProps,
} from 'rich-textarea';
import clsx from 'clsx';

import './FormTextarea.scss';

type TextareaProps = TextareaAutosizeProps &
  RichTextareaProps & {
    label: string;
    name: string;
    hideLabel?: boolean;
    showMaxLength?: boolean;
    maxLengthBottom?: boolean;
    useRichText?: boolean;
    height?: number;
  };

const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      name,
      maxLength = 2000,
      minRows = 3,
      maxRows = 3,
      disabled,
      hideLabel,
      showMaxLength,
      maxLengthBottom,
      defaultValue,
      useRichText,
      height = 95,
      onChange,
      ...rest
    },
    ref
  ) => {
    const id = useId();
    const [initial, setInitial] = useState<boolean>(true);
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

    useEffect(() => {
        if(!initial) return;
        if(showMaxLength && defaultValue && typeof defaultValue === 'string') {
            setInitial(false);
            setCurrentLength(defaultValue.toString().length)
        }
    }, [defaultValue]);

    return (
      <div className={textareaClasses}>
        {label && !hideLabel && (
          <label htmlFor={id} className="textarea__label">
            {label}
          </label>
        )}
        <div className="textarea__wrapper">
          {useRichText ? (
            <RichTextarea
              id={id}
              style={{ width: '100%', height: `${height}px` }}
              maxLength={maxLength === -1 ? undefined : maxLength}
              ref={ref}
              defaultValue={defaultValue ?? ''}
              aria-label={hideLabel ? label : undefined}
              onChange={(e) => {
                if (onChange) onChange(e);
                handleOnChange(e);
              }}
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length
                )
              }
            >
              {createRegexRenderer([
                [
                  /https?:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+/g,
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
          ) : (
            <TextareaAutosize
              id={id}
              maxLength={maxLength === -1 ? undefined : maxLength}
              minRows={minRows}
              maxRows={maxRows === -1 ? undefined : maxRows}
              ref={ref}
              defaultValue={defaultValue}
              aria-label={hideLabel ? label : undefined}
              onChange={(e) => {
                if (onChange) onChange(e);
                handleOnChange(e);
              }}
              {...rest}
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length
                )
              }
            />
          )}
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

export default FormTextarea;
