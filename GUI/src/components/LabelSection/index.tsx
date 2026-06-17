import { Button, Icon, Tooltip, Track } from 'components';
import { FC, Fragment, KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
import './LabelSection.scss';

type LabelSectionProps = {
  readonly title: string;
  readonly placeholder: string;
  readonly hint: string;
  readonly tooltip: string;
  readonly addButtonLabel?: string;
  readonly dragHintLabel?: string;
  readonly labels: readonly string[];
  readonly inputValue: string;
  readonly onInputChange: (val: string) => void;
  readonly onAdd: () => void;
  readonly onDeleteRequest: (index: number, label: string) => void;
  readonly onReorder: (newLabels: string[]) => void;
};

const LabelSection: FC<LabelSectionProps> = ({
  title,
  placeholder,
  hint,
  tooltip,
  addButtonLabel,
  dragHintLabel,
  labels,
  inputValue,
  onInputChange,
  onAdd,
  onDeleteRequest,
  onReorder,
}) => {
  const { t } = useTranslation();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const reorder = (from: number, to: number) => {
    const result = [...labels];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    onReorder(result);
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      reorder(dragIndex, dragOverIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleChipKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight' && index < labels.length - 1) {
      e.preventDefault();
      reorder(index, index + 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      reorder(index, index - 1);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      onDeleteRequest(index, labels[index]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onAdd();
  };

  let insertionIndex: number | null = null;
  if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
    insertionIndex = dragIndex > dragOverIndex ? dragOverIndex : dragOverIndex + 1;
  }

  const dropIndicator = (
    <div
      aria-hidden="true"
      className="label-section__drop-indicator"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    />
  );

  return (
    <Track direction="vertical" align="left" gap={0} className="label-section">
      <Track gap={16} align="center" className="label-section__header">
        <span className="switch__label">{title}</span>
        <div className="label-section__input-wrapper">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="label-section__input"
          />
          <Button appearance="secondary" onClick={onAdd} className="label-section__add-button">
            {addButtonLabel ?? `+ ${t('global.add')}`}
          </Button>
          <Tooltip content={tooltip}>
            <span>
              <Icon icon={<AiOutlineInfoCircle fontSize={20} color="#005aa3" />} size="medium" />
            </span>
          </Tooltip>
        </div>
      </Track>

      <div className="label-section__content">
        <p className="label-section__hint">{hint}</p>

        {labels.length > 0 && (
          <>
            <ul
              aria-label={title}
              className="label-section__chips-list"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {labels.map((label, index) => {
                const isDragging = dragIndex === index;

                return (
                  <Fragment key={`${label}-${index}`}>
                    {insertionIndex === index && dropIndicator}
                    <li className={`label-section__chip${isDragging ? ' label-section__chip--dragging' : ''}`}>
                      <button
                        type="button"
                        aria-label={`${label}, use arrow keys to reorder`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDrop();
                        }}
                        onDragEnd={handleDragEnd}
                        onKeyDown={(e) => handleChipKeyDown(e, index)}
                        className="label-section__chip-handle"
                      >
                        <span className="label-section__chip-label">{label}</span>
                      </button>
                      <button
                        onClick={() => onDeleteRequest(index, label)}
                        className="label-section__chip-delete"
                        aria-label={`Remove ${label}`}
                      >
                        <MdClose size={14} />
                      </button>
                    </li>
                  </Fragment>
                );
              })}
              {insertionIndex === labels.length && dropIndicator}
            </ul>
            {dragHintLabel && <p className="label-section__drag-hint">{dragHintLabel}</p>}
          </>
        )}
      </div>
    </Track>
  );
};

export default LabelSection;
