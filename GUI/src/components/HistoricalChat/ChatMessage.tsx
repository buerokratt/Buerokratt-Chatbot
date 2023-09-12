import { FC } from 'react';
import { format } from 'date-fns';

import { Message } from 'types/message';
import Linkifier from 'components/Chat/linkifier';

type ChatMessageProps = {
  message: Message;
  onMessageClick?: (message: Message) => void;
};

const ChatMessage: FC<ChatMessageProps> = ({ message, onMessageClick }) => {
  return (
    <div className="historical-chat__message">
      <div
        className="historical-chat__message-text"
        onClick={onMessageClick ? () => onMessageClick(message) : undefined}
      >
        <Linkifier message={decodeURIComponent(message.content ?? '')} />
      </div>
      <time
        dateTime={message.authorTimestamp}
        className="historical-chat__message-date"
      >
        {format(new Date(message.authorTimestamp), 'HH:mm:ss')}
      </time>
    </div>
  );
};

export default ChatMessage;
