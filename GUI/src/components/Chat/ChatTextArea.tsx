import { ChangeEvent, forwardRef, useId, useState } from 'react';
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize';
import clsx from 'clsx';

import './ChatTextArea.scss';
import { useTranslation } from 'react-i18next';

type TextareaProps = TextareaAutosizeProps & {
  label: string;
  name: string;
  hideLabel?: boolean;
  showMaxLength?: boolean;
  maxLengthBottom?: boolean;
};

const ChatTextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      onChange,
      onSubmit,
      ...rest
    },
    ref
  ) => {
    const id = useId();
    const {i18n} = useTranslation();
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
          <TextareaAutosize
            id={id}
            maxLength={maxLength}
            minRows={minRows}
            maxRows={maxRows}
            lang={i18n.language === 'et' ? 'et' : 'en'}
            spellCheck={'true'}
            ref={ref}
            onKeyDownCapture={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (onSubmit) onSubmit(e);
              }
            }}
            defaultValue={defaultValue}
            aria-label={hideLabel ? label : undefined}
            onChange={(e) => {
              if (onChange) onChange(e);
              handleOnChange(e);
            }}
            {...rest}
          />
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

export default ChatTextArea;
