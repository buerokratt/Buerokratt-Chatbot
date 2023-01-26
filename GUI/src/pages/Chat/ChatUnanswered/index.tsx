import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceStrict } from 'date-fns';
import { et } from 'date-fns/locale';

import { Track, Chat } from 'components';
import { Chat as ChatType } from 'types/chat';
import useUserInfoStore from 'store/store';

const ChatUnanswered: FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { data: activeChats } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-active-chats'],
  });

  const selectedChat = useMemo(() => activeChats && activeChats.find((c) => c.id === selectedChatId), [activeChats, selectedChatId]);
  const unansweredChats = useMemo(() => activeChats ? activeChats.filter((c) => c.customerSupportId === '') : [], [activeChats]);

  return (
    <Tabs.Root
      className='vertical-tabs'
      orientation='vertical'
      onValueChange={setSelectedChatId}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      <Tabs.List
        className='vertical-tabs__list'
        aria-label={t('chat.active.list') || ''}
        style={{ overflow: 'auto' }}
      >
        <div className='vertical-tabs__group-header'>
          <p>{t('chat.unansweredChats')}</p>
        </div>
        {unansweredChats.map((chat) => (
          <Tabs.Trigger
            key={chat.id}
            className='vertical-tabs__trigger'
            value={chat.id}
            style={{ borderBottom: '1px solid #D2D3D8' }}
          >
            <div style={{ fontSize: 14, lineHeight: '1.5', color: '#09090B' }}>
              <Track justify='between'>
                {chat.endUserFirstName !== '' && chat.endUserLastName !== '' ? (
                  <p><strong>{chat.endUserFirstName} {chat.endUserLastName}</strong></p>
                ) : <p><strong>{t('global.anonymous')}</strong></p>}
                {chat.lastMessageTimestamp && (
                  <p
                    style={{ color: '#4D4F5D' }}>
                    {formatDistanceStrict(new Date(chat.lastMessageTimestamp), new Date(), { locale: et })}
                  </p>
                )}
              </Track>
              <p style={{ color: '#4D4F5D' }}>{chat.lastMessage}</p>
            </div>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {selectedChatId ? (
        <Tabs.Content
          className='vertical-tabs__body'
          value={selectedChatId}
        >
          {selectedChat && <Chat chat={selectedChat} />}
        </Tabs.Content>
      ) : (
        <div className='vertical-tabs__body-placeholder'>
          <p className='h3' style={{ color: '#9799A4' }}>{t('chat.active.chooseChat')}</p>
        </div>
      )}
    </Tabs.Root>
  );
};

export default ChatUnanswered;
