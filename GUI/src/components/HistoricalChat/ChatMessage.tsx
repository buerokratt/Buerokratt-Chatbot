import ButtonMessage from 'components/ButtonMessage';
import Markdownify from 'components/Chat/Markdownify';
import OptionMessage from 'components/OptionMessage';
import { format } from 'date-fns';
import { FC, useMemo } from 'react';
import { Message } from 'types/message';
import { parseButtons, parseOptions } from 'utils/parse-utils';

import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

type ChatMessageProps = {
  message: Message;
  onMessageClick?: (message: Message) => void;
};

const ChatMessage: FC<ChatMessageProps> = ({ message, onMessageClick }) => {
  const buttons = useMemo(() => parseButtons(message), [message.buttons]);
  const options = useMemo(() => parseOptions(message), [message.options]);
  const copyToClipboard = useCopyToClipboard();

  const handleClick = () => {
    copyToClipboard(message.content ?? '');
    onMessageClick?.(message);
  };

  return (
    <>
      <div className="historical-chat__message">
        <button
          className="historical-chat__message-text"
          onClick={handleClick}
        >
          <Markdownify message={message.content ?? ''} sanitizeLinks={message.authorRole === 'end-user'} />
        </button>
        <time dateTime={message.created} className="historical-chat__message-date">
          {format(new Date(message.created), 'HH:mm:ss')}
        </time>
      </div>
      {buttons.length > 0 && <ButtonMessage buttons={buttons} />}
      {options.length > 0 && <OptionMessage options={options} />}
    </>
  );
};

export default ChatMessage;
