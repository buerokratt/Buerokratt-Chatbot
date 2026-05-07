import { Button, Icon, Tooltip, Track } from 'components';
import { FC, Fragment, KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';

export type LabelSectionProps = {
  title: string;
  placeholder: string;
  hint: string;
  tooltip: string;
  addButtonLabel?: string;
  dragHintLabel?: string;
  labels: string[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onAdd: () => void;
  onDeleteRequest: (index: number, label: string) => void;
  onReorder: (newLabels: string[]) => void;
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
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

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

  const handleChipKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
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

  const insertionIndex =
    dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex
      ? dragIndex > dragOverIndex
        ? dragOverIndex
        : dragOverIndex + 1
      : null;

  const dropIndicator = (
    <div
      aria-hidden="true"
      style={{
        width: '2px',
        alignSelf: 'stretch',
        minHeight: '28px',
        backgroundColor: '#005aa3',
        borderRadius: '2px',
        flexShrink: 0,
        transition: 'opacity 0.1s',
      }}
    />
  );

  return (
    <Track direction="vertical" align="left" gap={0} style={{ width: '100%' }}>
      <Track gap={16} align="center" style={{ width: '100%', paddingBottom: '8px' }}>
        <span className="switch__label">{title}</span>
        <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #CBD4E1',
              borderRadius: '4px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <Button appearance="secondary" onClick={onAdd} style={{ whiteSpace: 'nowrap' }}>
            {addButtonLabel ?? `+ ${t('global.add')}`}
          </Button>
          <Tooltip content={tooltip}>
            <span>
              <Icon icon={<AiOutlineInfoCircle fontSize={20} color="#005aa3" />} size="medium" />
            </span>
          </Tooltip>
        </div>
      </Track>

      <div style={{ paddingLeft: '201px' }}>
        <p style={{ color: '#686B78', fontSize: '13px', marginBottom: '12px' }}>{hint}</p>

        {labels.length > 0 && (
          <>
            <div
              role="list"
              aria-label={title}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}
            >
              {labels.map((label, index) => {
                const isDragging = dragIndex === index;

                return (
                  <Fragment key={`${label}-${index}`}>
                    {insertionIndex === index && dropIndicator}
                    <div
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${label}, use arrow keys to reorder`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onKeyDown={(e) => handleChipKeyDown(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        backgroundColor: '#EBF1F8',
                        borderRadius: '4px',
                        border: `1px solid ${isDragging ? '#005aa3' : '#CBD4E1'}`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        gap: '6px',
                        opacity: isDragging ? 0.35 : 1,
                        transform: isDragging ? 'scale(1.04)' : 'scale(1)',
                        boxShadow: isDragging
                          ? '0 4px 14px rgba(0,90,163,0.2)'
                          : focusedIndex === index
                          ? '0 0 0 2px #005aa3'
                          : 'none',
                        transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                        outline: 'none',
                        userSelect: 'none',
                      }}
                    >
                      <span style={{ fontSize: '14px', color: '#1D2739' }}>{label}</span>
                      <button
                        onClick={() => onDeleteRequest(index, label)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#5A6473',
                        }}
                        aria-label={`Remove ${label}`}
                      >
                        <MdClose size={14} />
                      </button>
                    </div>
                  </Fragment>
                );
              })}
              {insertionIndex === labels.length && dropIndicator}
            </div>
            {dragHintLabel && (
              <p style={{ color: '#686B78', fontSize: '13px' }}>{dragHintLabel}</p>
            )}
          </>
        )}
      </div>
    </Track>
  );
};

export default LabelSection;
