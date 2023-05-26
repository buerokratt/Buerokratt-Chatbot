import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceStrict } from 'date-fns';
import { et } from 'date-fns/locale';
import { Track } from 'components';
import { Chat as ChatType } from 'types/chat';
import './ChatActive.scss';

const ChatTrigger: FC<{ chat: ChatType }> = ({ chat }) => {
  const { t } = useTranslation();

  const name = chat.endUserFirstName !== '' && chat.endUserLastName !== ''
    ? `${chat.endUserFirstName} ${chat.endUserLastName}`
    : t('global.anonymous');

  return (
    <div style={{ fontSize: 14, lineHeight: '1.5', color: '#4D4F5D' }}>
      <Track justify='between'>
        <p>
          <strong>{name}</strong>
        </p>
        {chat.lastMessageTimestamp && (
          <p>
            {formatDistanceStrict(new Date(chat.lastMessageTimestamp), new Date(), { locale: et })}
          </p>
        )}
      </Track>
      <div className="wrapper">
        <p className="last_message">{chat.lastMessage}.</p>
      </div>
    </div>
  );
};

export default ChatTrigger;
