import { FC, useMemo } from 'react';
import { format } from 'date-fns';
import { Message } from 'types/message';
import Markdownify from 'components/Chat/Markdownify';
import { parseButtons, parseOptions } from 'utils/parse-utils';
import ButtonMessage from 'components/ButtonMessage';
import OptionMessage from 'components/OptionMessage';

type ChatMessageProps = {
  message: Message;
  onMessageClick?: (message: Message) => void;
};

const ChatMessage: FC<ChatMessageProps> = ({ message, onMessageClick }) => {
  const buttons = useMemo(() => parseButtons(message), [message.buttons]);
  const options = useMemo(() => parseOptions(message), [message.options]);

  return (
    <>
      <div className="historical-chat__message">
        <button
          className="historical-chat__message-text"
          onClick={onMessageClick ? () => onMessageClick(message) : undefined}
        >
          <Markdownify message={message.content ?? ''} />
        </button>
        <time
          dateTime={message.authorTimestamp}
          className="historical-chat__message-date"
        >
          {format(new Date(message.authorTimestamp), 'HH:mm:ss')}
        </time>
      </div>
      {buttons.length > 0 && <ButtonMessage buttons={buttons} />}
      {options.length > 0 && <OptionMessage options={options} />}
    </>
  );
};

export default ChatMessage;
