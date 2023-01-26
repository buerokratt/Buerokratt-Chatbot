import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Message } from 'types/message';
import { CHAT_EVENTS } from 'types/chat';

type ChatEventProps = {
  message: Message;
}

const ChatEvent: FC<ChatEventProps> = ({ message }) => {
  const { t } = useTranslation();
  const { event, authorRole } = message;

  return (
    <div className='active-chat__event-message'>
      {event === CHAT_EVENTS.REDIRECTED && (
        <p>{t('chat.redirectedMessage')}</p>
      )}
    </div>
  );
};

export default ChatEvent;
