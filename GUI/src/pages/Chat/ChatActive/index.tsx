import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Chat, Dialog, Button, FormRadios } from 'components';
import {
  Chat as ChatType,
  CHAT_EVENTS,
  CHAT_STATUS,
  GroupedChat,
} from 'types/chat';
import useUserInfoStore from 'store/store';
import { User } from 'types/user';
import { useToast } from 'hooks/useToast';
import apiDev from 'services/api-dev';
import ForwardToColleaugeModal from '../ForwardToColleaugeModal';
import ForwardToEstablishmentModal from '../ForwardToEstablishmentModal';
import clsx from 'clsx';
import StartAServiceModal from '../StartAServiceModal';
import ChatTrigger from './ChatTrigger';
import './ChatActive.scss';
import apiDevV2 from 'services/api-dev-v2';

const CSAchatStatuses = [
  CHAT_EVENTS.ACCEPTED,
  CHAT_EVENTS.HATE_SPEECH,
  CHAT_EVENTS.OTHER,
  CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL,
];

const ChatActive: FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const toast = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [endChatModal, setEndChatModal] = useState<ChatType | null>(null);
  const [forwardToColleaugeModal, setForwardToColleaugeModal] =
    useState<ChatType | null>(null);
  const [forwardToEstablishmentModal, setForwardToEstablishmentModal] =
    useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(
    null
  );
  const [startAServiceModal, setStartAServiceModal] = useState<ChatType | null>(
    null
  );
  const [activeChatsList, setActiveChatsList] = useState<ChatType[]>([]);
  const [selectedEndChatStatus, setSelectedEndChatStatus] = useState<
    string | null
  >(null);

  const { refetch } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-active-chats', 'prod'],
    onSuccess(res: any) {
      setActiveChatsList(res.data.get_all_active_chats);
    },
  });

  const { data: csaNameVisiblity } = useQuery<{ isVisible: boolean }>({
    queryKey: ['cs-get-csa-name-visibility', 'prod-2'],
  });

  const { data: csaTitleVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['cs-get-csa-title-visibility', 'prod-2'],
  });

  const sendToEmailMutation = useMutation({
    mutationFn: (data: ChatType) =>
      apiDevV2.post('history/cs-send-history-to-email', { chatId: data.id }),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.messageToUserEmail'),
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

  const selectedChat = useMemo(
    () =>
      activeChatsList && activeChatsList.find((c) => c.id === selectedChatId),
    [activeChatsList, selectedChatId]
  );

  const activeChats: GroupedChat = useMemo(() => {
    const grouped: GroupedChat = {
      myChats: [],
      otherChats: [],
    };

    if (!activeChatsList) return grouped;

    activeChatsList.forEach((c) => {
      if (c.customerSupportId === userInfo?.idCode) {
        grouped.myChats.push(c);
        return;
      }

      const groupIndex = grouped.otherChats.findIndex(
        (x) => x.groupId === c.customerSupportId
      );
      if (groupIndex === -1) {
        grouped.otherChats.push({
          groupId: c.customerSupportId ?? '',
          name: c.customerSupportDisplayName ?? '',
          chats: [c],
        });
      } else {
        grouped.otherChats[groupIndex].chats.push(c);
      }
    });

    grouped.otherChats.sort((a, b) => a.name.localeCompare(b.name));

    return grouped;
  }, [activeChatsList]);

  const handleCsaForward = async (chat: ChatType, user: User) => {
    try {
      await apiDev.post('cs-redirect-chat', {
        id: chat.id ?? '',
        customerSupportId: user?.idCode ?? '',
        customerSupportDisplayName: user?.displayName ?? '',
        csaTitle: user?.csaTitle ?? '',
        forwardedByUser: userInfo?.idCode ?? '',
        forwardedFromCsa: userInfo?.idCode ?? '',
        forwardedToCsa: user?.idCode ?? '',
      }),
        setForwardToColleaugeModal(null);
      refetch();
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: `Chat forwarded to ${user.displayName}`,
      });
    } catch (error) {
      toast.open({
        type: 'warning',
        title: t('global.notificationError'),
        message: `Chat ended`,
      });
    }
  };

  const handleEstablishmentForward = (
    chat: ChatType,
    establishment: string
  ) => {
    // TODO: Add endpoint for chat forwarding
    setForwardToEstablishmentModal(null);
    toast.open({
      type: 'success',
      title: t('global.notification'),
      message: `Chat forwarded to ${establishment}`,
    });
  };

  const handleChatEnd = async () => {
    if (!selectedEndChatStatus) return;

    try {
      await apiDev.post('cs-end-chat', {
        chatId: selectedChatId,
        event: selectedEndChatStatus.toUpperCase(),
        authorTimestamp: new Date().toISOString(),
        authorFirstName: userInfo!.firstName,
        authorId: userInfo!.idCode,
        authorRole: userInfo!.authorities,
      });
      refetch();
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: `Chat ended`,
      });
    } catch (error) {
      toast.open({
        type: 'warning',
        title: t('global.notificationError'),
        message: `Chat ended`,
      });
    }
    setEndChatModal(null);
    setSelectedEndChatStatus(null);
  };

  return (
    <>
      <Tabs.Root
        className="vertical-tabs"
        orientation="vertical"
        onValueChange={setSelectedChatId}
        style={{ height: '100%', overflow: 'hidden' }}
      >
        <Tabs.List
          className="vertical-tabs__list"
          aria-label={t('chat.active.list') || ''}
          style={{ overflow: 'auto' }}
        >
          <div className="vertical-tabs__group-header">
            <p>{t('chat.active.myChats')}</p>
          </div>
          {activeChats?.myChats?.map((chat) => (
            <Tabs.Trigger
              key={chat.id}
              className={clsx('vertical-tabs__trigger', {
                active:
                  chat.status === CHAT_STATUS.REDIRECTED &&
                  chat.customerSupportId === userInfo?.idCode,
              })}
              value={chat.id}
              style={{ borderBottom: '1px solid #D2D3D8' }}
            >
              <ChatTrigger chat={chat} />
            </Tabs.Trigger>
          ))}
          <div className="vertical-tabs__group-header">
            <p>{t('chat.active.newChats')}</p>
          </div>
          {activeChats?.otherChats?.map(({ name, chats }) => (
            <>
              {name && (
                <div className="vertical-tabs__sub-group-header">
                  <p>{name}</p>
                </div>
              )}
              {chats.map((chat, i) => (
                <Tabs.Trigger
                  key={chat.id + i}
                  className={clsx('vertical-tabs__trigger', {
                    active:
                      chat.status === CHAT_STATUS.REDIRECTED &&
                      chat.customerSupportId === userInfo?.idCode,
                  })}
                  value={chat.id}
                  style={{ borderBottom: '1px solid #D2D3D8' }}
                >
                  <ChatTrigger chat={chat} />
                </Tabs.Trigger>
              ))}
            </>
          ))}
        </Tabs.List>

        {selectedChatId ? (
          <Tabs.Content className="vertical-tabs__body" value={selectedChatId}>
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
                onRefresh={refetch}
              />
            )}
          </Tabs.Content>
        ) : (
          <div className="vertical-tabs__body-placeholder">
            <p className="h3" style={{ color: '#9799A4' }}>
              {t('chat.active.chooseChat')}
            </p>
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
              <Button
                appearance="secondary"
                onClick={() => setSendToEmailModal(null)}
              >
                {t('global.no')}
              </Button>
              <Button
                appearance="error"
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
              <Button
                appearance="secondary"
                onClick={() => setEndChatModal(null)}
              >
                {t('global.cancel')}
              </Button>
              <Button appearance="success" onClick={handleChatEnd}>
                {t('chat.active.endChat')}
              </Button>
            </>
          }
        >
          <FormRadios
            name="endedChatStatuses"
            label={t('')}
            items={CSAchatStatuses.map((status) => ({
              label: t(`chat.events.${status}`, { date: '' }),
              value: status,
            }))}
            onChange={setSelectedEndChatStatus}
          />
        </Dialog>
      )}
    </>
  );
};

export default ChatActive;
