import { FC, useMemo, useState } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { MdOutlineCheck } from 'react-icons/md';
import { Message } from '../../types/message';
import { CHAT_EVENTS, MessageStatus } from '../../types/chat';
import Linkifier from './linkifier';
import { useTranslation } from 'react-i18next';
import './Typing.scss';
import { parseButtons, parseOptions } from 'utils/parse-utils';
import ButtonMessage from 'components/ButtonMessage';
import OptionMessage from 'components/OptionMessage';

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
  
  const buttons = useMemo(() => parseButtons(message), [message.buttons]);
  const options = useMemo(() => parseOptions(message), [message.options]);

  return (
    <div className={clsx('active-chat__messageContainer')}>
      <div
        className={clsx('active-chat__message', {
          'active-chat__message--selected': selected,
        })}
      >
        <button
          className={clsx('active-chat__message-text')}
          onClick={() => {
            setSelected(!selected);
            onSelect(message);
          }}
        >
          <Linkifier message={decodeURIComponent(message.content ?? '')} />
        </button>
        {buttons.length > 0 && <ButtonMessage buttons={buttons} />}
        {options.length > 0 && <OptionMessage options={options} />}
        <time
          dateTime={message.authorTimestamp}
          className="active-chat__message-date"
        >
          {format(new Date(message.authorTimestamp), 'HH:mm:ss')}
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
            {format(new Date(message.authorTimestamp), 'HH:mm:ss')}
          </time>
        </span>
      ) : null}{' '}
    </div>
  );
};

export default ChatMessage;
