import { FC } from 'react';
import { format } from 'date-fns';

import { Message } from 'types/message';

type ChatMessageProps = {
  message: Message;
}

const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className='active-chat__message'>
      <div className='active-chat__message-text'>{message.content}</div>
      <time dateTime={message.authorTimestamp} className='active-chat__message-date'>
        {format(new Date(message.authorTimestamp), 'HH:ii:ss')}
      </time>
    </div>
  );
};

export default ChatMessage;
