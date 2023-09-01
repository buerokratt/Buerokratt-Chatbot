import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Track } from 'components';
import { Chat as ChatType } from 'types/chat';
import { format } from 'timeago.js';
import './ChatActive.scss';

const ChatTrigger: FC<{ chat: ChatType }> = ({ chat }) => {
  const { t } = useTranslation();

  const name =
    chat.endUserFirstName !== '' && chat.endUserLastName !== ''
      ? `${chat.endUserFirstName} ${chat.endUserLastName}`
      : t('global.anonymous');

  return (
    <div style={{ fontSize: 14, lineHeight: '1.5', color: '#4D4F5D' }}>
      <Track justify="between">
        <p>
          <strong>{name}</strong>
        </p>
        {chat.lastMessageTimestamp && (
          <p>
            {format(
              chat.lastMessageTimestamp ?? new Date().toISOString,
              'et_EE'
            )}
          </p>
        )}
      </Track>
      <div className="wrapper">
        <p className="last_message">
          {decodeURIComponent(`${chat.lastMessage}.` ?? '')}
        </p>
      </div>
    </div>
  );
};

export default ChatTrigger;
