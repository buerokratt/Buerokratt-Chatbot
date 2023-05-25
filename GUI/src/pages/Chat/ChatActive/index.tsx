import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceStrict } from 'date-fns';
import { AxiosError } from 'axios';
import { et } from 'date-fns/locale';

import { Track, Chat, Dialog, Button, FormRadios } from 'components';
import { Chat as ChatType, CHAT_STATUS } from 'types/chat';
import useUserInfoStore from 'store/store';
import { User } from 'types/user';
import { useToast } from 'hooks/useToast';
import api from 'services/api';
import ForwardToColleaugeModal from '../ForwardToColleaugeModal';
import ForwardToEstablishmentModal from '../ForwardToEstablishmentModal';
import clsx from 'clsx';
import StartAServiceModal from '../StartAServiceModal';
import './ChatActive.scss';

const CSAchatStatuses = [
  'accepted',
  'hate-speech',
  'other',
  'response-sent-to-client-email',
];

const ChatActive: FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const toast = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [endChatModal, setEndChatModal] = useState<ChatType | null>(null);
  const [forwardToColleaugeModal, setForwardToColleaugeModal] = useState<ChatType | null>(null);
  const [forwardToEstablishmentModal, setForwardToEstablishmentModal] = useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(null);
  const [startAServiceModal, setStartAServiceModal] = useState<ChatType | null>(null);
  const [activeChatsList, setActiveChatsList] = useState<ChatType[]>([]);

  const { data: chatData } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-active-chats', 'prod'],
    onSuccess(res: any) {
      setActiveChatsList(res.data.get_all_active_chats);
    },
  });

  const { data: csaNameVisiblity } = useQuery<{isVisible: boolean}>({
    queryKey: ['cs-get-csa-name-visibility', 'prod-2'],
  });

  const { data: csaTitleVisibility } = useQuery<{isVisible: boolean}>({
    queryKey: ['cs-get-csa-title-visibility', 'prod-2'],
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

  const selectedChat = useMemo(() => activeChatsList && activeChatsList.find((c) => c.id === selectedChatId), [activeChatsList, selectedChatId]);
  const activeChats = useMemo(() => activeChatsList ? activeChatsList.filter((c) => c.customerSupportId !== '') : [], [activeChatsList]);

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
              className={
                clsx('vertical-tabs__trigger', {
                  'active': chat.status === CHAT_STATUS.REDIRECTED && chat.customerSupportId !== userInfo?.idCode,
                })
              }
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
                isCsaNameVisible={csaNameVisiblity?.isVisible ?? false}
                isCsaTitleVisible={csaTitleVisibility?.isVisible ?? false}
                onChatEnd={setEndChatModal}
                onForwardToColleauge={setForwardToColleaugeModal}
                onForwardToEstablishment={setForwardToEstablishmentModal}
                onSendToEmail={setSendToEmailModal}
                onStartAService={setStartAServiceModal}
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

      {startAServiceModal !== null && (
        <StartAServiceModal
          chat={startAServiceModal}
          onModalClose={() => setStartAServiceModal(null)}
        />
      )}

      {endChatModal && (
        <Dialog
          title={t('chat.active.chooseChatStatus')}
          onClose={() => setEndChatModal(null)}
          footer={
            <>
              <Button appearance='secondary'>{t('global.cancel')}</Button>
              <Button appearance='success' onClick={handleChatEnd}>{t('chat.active.endChat')}</Button>
            </>
          }
        >
          <FormRadios name='endedChatStatuses' label={t('')} items={CSAchatStatuses.map((status) => ({
            label: t(`chat.events.${status}`),
            value: status,
          }))} />
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
      <div className="wrapper">
        <p className="last_message">{chat.lastMessage}.</p>
      </div>
    </div>
  );
};

export default ChatActive;
