import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceStrict } from 'date-fns';
import { et } from 'date-fns/locale';

import { Track, Chat } from 'components';
import { Chat as ChatType } from 'types/chat';
import useUserInfoStore from 'store/store';
import { User } from 'types/user';
import { useToast } from 'hooks/useToast';

const ChatUnanswered: FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const toast = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [endChatModal, setEndChatModal] = useState<ChatType | null>(null);
  const [forwardToColleaugeModal, setForwardToColleaugeModal] = useState<ChatType | null>(null);
  const [forwardToEstablishmentModal, setForwardToEstablishmentModal] = useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(null);
  const [activeChatsList, setActiveChatsList] = useState<ChatType[]>([]);
  const { data: activeChats } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-active-chats', 'prod'],
    onSuccess(res: any) {
      setActiveChatsList(res.data.get_all_active_chats);
    },
  });

  const selectedChat = useMemo(() => activeChatsList && activeChatsList.find((c) => c.id === selectedChatId), [activeChatsList, selectedChatId]);
  const unansweredChats = useMemo(() => activeChatsList ? activeChatsList.filter((c) => c.customerSupportId === '') : [], [activeChatsList]);

  const handleCsaForward = (chat: ChatType, user: User) => {
    // TODO: Add endpoint for chat forwarding
    setForwardToColleaugeModal(null);
    toast.open({
      type: 'success',
      title: t('global.notification'),
      message: `Chat forwarded to ${user.displayName}`,
    });
  };

  const handleEstablishmentForward = (chat: ChatType, establishment: string) => {
    // TODO: Add endpoint for chat forwarding
    setForwardToEstablishmentModal(null);
    toast.open({
      type: 'success',
      title: t('global.notification'),
      message: `Chat forwarded to ${establishment}`,
    });
  };

  const handleChatEnd = () => {
    // TODO: Add endpoint for chat ending
    setEndChatModal(null);
    toast.open({
      type: 'success',
      title: t('global.notification'),
      message: `Chat ended`,
    });
  };

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
          {selectedChat && (
            <Chat
              chat={selectedChat}
              onChatEnd={setEndChatModal}
              onForwardToColleauge={setForwardToColleaugeModal}
              onForwardToEstablishment={setForwardToEstablishmentModal}
              onSendToEmail={setSendToEmailModal}
            />
          )}
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
