import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceStrict } from 'date-fns';
import { AxiosError } from 'axios';
import { et } from 'date-fns/locale';

import { Track, Chat, Dialog, Button } from 'components';
import { Chat as ChatType } from 'types/chat';
import useUserInfoStore from 'store/store';
import { User } from 'types/user';
import { useToast } from 'hooks/useToast';
import api from 'services/api';
import ForwardToColleaugeModal from '../ForwardToColleaugeModal';
import ForwardToEstablishmentModal from '../ForwardToEstablishmentModal';

const ChatActive: FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const toast = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [forwardToColleaugeModal, setForwardToColleaugeModal] = useState<ChatType | null>(null);
  const [forwardToEstablishmentModal, setForwardToEstablishmentModal] = useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(null);
  const { data: chatData } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-active-chats'],
  });

  const sendToEmailMutation = useMutation({
    mutationFn: (data: ChatType) => api.post('cs-send-chat-to-email', data),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: 'Message sent to user email',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setSendToEmailModal(null),
  });

  const selectedChat = useMemo(() => chatData && chatData.find((c) => c.id === selectedChatId), [chatData, selectedChatId]);
  const activeChats = useMemo(() => chatData ? chatData.filter((c) => c.customerSupportId !== '') : [], [chatData]);

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

  return (
    <>
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
            <p>{t('chat.active.myChats')}</p>
          </div>
          {activeChats.filter((chat) => chat.customerSupportId === userInfo?.idCode).map((chat) => (
            <Tabs.Trigger
              key={chat.id}
              className='vertical-tabs__trigger'
              value={chat.id}>
              <ChatTrigger chat={chat} />
            </Tabs.Trigger>
          ))}
          <div className='vertical-tabs__group-header'>
            <p>{t('chat.active.newChats')}</p>
          </div>
          {activeChats.filter((chat) => chat.customerSupportId !== userInfo?.idCode).map((chat) => (
            <Tabs.Trigger
              key={chat.id}
              className='vertical-tabs__trigger'
              value={chat.id}
              style={{ borderBottom: '1px solid #D2D3D8' }}
            >
              <ChatTrigger chat={chat} />
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

      {forwardToColleaugeModal && (
        <ForwardToColleaugeModal
          chat={forwardToColleaugeModal}
          onModalClose={() => setForwardToColleaugeModal(null)}
          onForward={handleCsaForward}
        />
      )}

      {forwardToEstablishmentModal && (
        <ForwardToEstablishmentModal
          chat={forwardToEstablishmentModal}
          onModalClose={() => setForwardToEstablishmentModal(null)}
          onForward={handleEstablishmentForward}
        />
      )}

      {sendToEmailModal !== null && (
        <Dialog
          title={t('chat.active.sendToEmail')}
          onClose={() => setSendToEmailModal(null)}
          footer={
            <>
              <Button appearance='secondary' onClick={() => setSendToEmailModal(null)}>{t('global.no')}</Button>
              <Button
                appearance='error'
                onClick={() => sendToEmailMutation.mutate(sendToEmailModal)}
              >
                {t('global.yes')}
              </Button>
            </>
          }
        >
          <p>{t('global.removeValidation')}</p>
        </Dialog>
      )}
    </>
  );
};

const ChatTrigger: FC<{ chat: ChatType }> = ({ chat }) => {
  const { t } = useTranslation();

  return (
    <div style={{ fontSize: 14, lineHeight: '1.5', color: '#09090B' }}>
      <Track justify='between'>
        {chat.endUserFirstName !== '' && chat.endUserLastName !== '' ? (
          <p><strong>{chat.endUserFirstName} {chat.endUserLastName}</strong></p>
        ) : <p><strong>{t('global.anonymous')}</strong></p>}
        {chat.lastMessageTimestamp && (
          <p
            style={{ color: '#4D4F5D' }}>{formatDistanceStrict(new Date(chat.lastMessageTimestamp), new Date(), { locale: et })}</p>
        )}
      </Track>
      <p style={{ color: '#4D4F5D' }}>{chat.lastMessage}</p>
    </div>
  );
};

export default ChatActive;
