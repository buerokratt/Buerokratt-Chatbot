import { Button, Icon, Tooltip, Track } from 'components';
import { FC, KeyboardEvent } from 'react';
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
  dragField: string | null;
  dragIndex: number | null;
  dragOverIndex: number | null;
  fieldKey: string;
  onInputChange: (val: string) => void;
  onAdd: () => void;
  onDeleteRequest: (index: number, label: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: () => void;
  onDragEnd: () => void;
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
  dragField,
  dragIndex,
  dragOverIndex,
  fieldKey,
  onInputChange,
  onAdd,
  onDeleteRequest,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const { t } = useTranslation();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onAdd();
  };

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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {labels.map((label, index) => (
                <div
                  key={`${fieldKey}-${index}`}
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    backgroundColor:
                      dragField === fieldKey && dragOverIndex === index && dragIndex !== index
                        ? '#d0e4f7'
                        : '#EBF1F8',
                    borderRadius: '4px',
                    border: '1px solid #CBD4E1',
                    cursor: 'grab',
                    gap: '6px',
                    opacity: dragField === fieldKey && dragIndex === index ? 0.4 : 1,
                    transition: 'background-color 0.15s',
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
                    title="Remove"
                  >
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
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
