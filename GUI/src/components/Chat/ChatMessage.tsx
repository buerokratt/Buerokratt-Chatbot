import { FC, useState } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { MdOutlineCheck } from 'react-icons/md';
import { Message } from '../../types/message';
import { CHAT_EVENTS, MessageStatus } from '../../types/chat';
import Linkifier from './linkifier';
import { useTranslation } from 'react-i18next';

type ChatMessageProps = {
  message: Message;
  onSelect: (message: Message) => void;
  readStatus: {
    current: MessageStatus;
  };
};

const ChatMessage: FC<ChatMessageProps> = ({
  message,
  onSelect,
  readStatus,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(false);

  return (
    <div className={clsx('active-chat__messageContainer')}>
      <div
        className={clsx('active-chat__message', {
          'active-chat__message--selected': selected,
        })}
      >
        <div
          className={clsx(
            'active-chat__message-text',
            !!message.preview && 'active-chat__message-preview'
          )}
          onClick={() => {
            setSelected(!selected);
            onSelect(message);
          }}
        >
          <Linkifier message={decodeURIComponent(message.content ?? '')} />
          {!!message.preview && message.preview}
        </div>
        <time
          dateTime={message.authorTimestamp}
          className="active-chat__message-date"
        >
          {format(new Date(message.authorTimestamp), 'hh:mm:ss')}
        </time>
        {selected && (
          <div className="active-chat__selection-icon">
            <MdOutlineCheck />
          </div>
        )}
      </div>
      {message.event === CHAT_EVENTS.READ ? (
        <span className="active-chat__message-status">
          {t('global.read')}
          <time dateTime={message.authorTimestamp}>
            {' '}
            {format(new Date(message.authorTimestamp), 'hh:mm:ss')}
          </time>
        </span>
      ) : null}{' '}
    </div>
  );
};

export default ChatMessage;
