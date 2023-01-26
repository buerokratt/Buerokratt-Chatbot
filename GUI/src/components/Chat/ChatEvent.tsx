import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Message } from 'types/message';
import { CHAT_EVENTS } from 'types/chat';
import { format } from 'date-fns';

type ChatEventProps = {
  message: Message;
}

const ChatEvent: FC<ChatEventProps> = ({ message }) => {
  const { t } = useTranslation();
  const { event, authorTimestamp, forwardedFromCsa, forwardedToCsa } = message;

  return (
    <div className='active-chat__event-message'>
      {event === CHAT_EVENTS.REDIRECTED && (
        <p>{t('chat.redirectedMessage', {
          from: forwardedFromCsa,
          to: forwardedToCsa,
          date: format(new Date(authorTimestamp), 'dd.MM.yyyy HH:ii:ss'),
        })}</p>
      )}
    </div>
  );
};

export default ChatEvent;
