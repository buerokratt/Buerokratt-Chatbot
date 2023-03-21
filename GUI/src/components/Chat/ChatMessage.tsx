import { FC, useState } from 'react';
import { format } from 'date-fns';

import { Message } from 'types/message';
import clsx from 'clsx';
import { MdOutlineCheck } from 'react-icons/md';

type ChatMessageProps = {
  message: Message;
  onSelect: (message: Message) => void;
};

const ChatMessage: FC<ChatMessageProps> = ({ message, onSelect }) => {
  const [selected, setSelected] = useState(false);

  return (
    <div className={clsx('active-chat__messageContainer')}>
      <div
        className={clsx('active-chat__message', {
          'active-chat__message--selected': selected,
        })}
      >
        {!!message.preview ? (
          <div className="active-chat__message-preview">{message.preview}</div>
        ) : (
          <div
            className="active-chat__message-text"
            onClick={() => {
              setSelected(!selected);
              onSelect(message);
            }}
          >
            {message.content}
          </div>
        )}
        <time
          dateTime={message.authorTimestamp}
          className="active-chat__message-date"
        >
          {format(new Date(message.authorTimestamp), 'HH:ii:ss')}
        </time>
        {selected && (
          <div className="active-chat__selection-icon">
            <MdOutlineCheck />
          </div>
        )}
      </div>
      {message.event === 'message-read' ? (
        <span className="active-chat__message-status">
          Loetud
          <time dateTime={message.authorTimestamp}>
            {' '}
            {format(new Date(message.authorTimestamp), 'HH:ii:ss')}
          </time>
        </span>
      ) : null}{' '}
    </div>
  );
};

export default ChatMessage;
