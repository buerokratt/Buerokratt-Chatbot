import { FC, KeyboardEvent, useState } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import clsx from 'clsx';
import { Icon } from 'components';
import './FormTagInput.scss';

type FormTagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const FormTagInput: FC<FormTagInputProps> = ({
  tags,
  onChange,
  placeholder,
  className,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
        setInputValue('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (disabled) return;
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const containerClasses = clsx('tag-input', className, disabled && 'tag-input--disabled');

  return (
    <div className={containerClasses}>
      <div className="tag-input__container">
        <div className="tag-input__tags">
          {tags.map((tag, index) => (
            <div key={`${tag}-${index}`} className="tag-input__tag">
              <span className="tag-input__tag-text">{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className="tag-input__tag-close"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  <Icon icon={<MdOutlineClose />} size="small" />
                </button>
              )}
            </div>
          ))}
          <input
            type="text"
            className="tag-input__input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
          />
        </div>
        {tags.length > 0 && !disabled && (
          <button
            type="button"
            className="tag-input__clear-all"
            onClick={handleClearAll}
            aria-label="Clear all tags"
          >
            <Icon icon={<MdOutlineClose fontSize={18} />} size="medium" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FormTagInput;

