import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';

import { Chat, Dialog, Button, FormRadios, Track } from 'components';
import {
  CHAT_EVENTS,
  CHAT_STATUS,
  Chat as ChatType,
  GroupedPendingChat,
} from 'types/chat';
import useStore from 'store';
import { User } from 'types/user';
import { useToast } from 'hooks/useToast';
import './ChatPending.scss';
import apiDev from 'services/api-dev';
import ChatTrigger from '../ChatActive/ChatTrigger';
import clsx from 'clsx';
import ForwardToColleaugeModal from '../ForwardToColleaugeModal';
import ForwardToEstablishmentModal from '../ForwardToEstablishmentModal';
import sse from 'services/sse-service';
import { v4 as uuidv4 } from 'uuid';

const ChatPending: FC = () => {
  const { t } = useTranslation();
  const userInfo = useStore((state) => state.userInfo);
  const toast = useToast();
  const chatCsaActive = useStore((state) => state.chatCsaActive);
  const [endChatModal, setEndChatModal] = useState<ChatType | null>(null);
  const [forwardToColleaugeModal, setForwardToColleaugeModal] =
    useState<ChatType | null>(null);
  const [forwardToEstablishmentModal, setForwardToEstablishmentModal] =
    useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(
    null
  );
  const [selectedEndChatStatus, setSelectedEndChatStatus] = useState<
    string | null
  >(null);
  const CSAchatStatuses = [
    CHAT_EVENTS.ACCEPTED,
    CHAT_EVENTS.HATE_SPEECH,
    CHAT_EVENTS.OTHER,
    CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL,
  ];

  const pendingChats = useStore((state) => state.activeChats);
  const selectedChatId = useStore((state) => state.selectedChatId);
  const selectedChat = useStore((state) => state.selectedChat());
  const setPendingChats = useStore.getState().setActiveChats;

  const { refetch } = useQuery<ChatType[]>({
    queryKey: ['csa/pending-chats', 'prod'],
    onSuccess(res: any) {
      setPendingChats(res.response);
    },
  });

  useEffect(() => {
    refetch();
  }, [chatCsaActive]);

  useEffect(() => {
    const onMessage = async () => {
      const res = await apiDev.get('csa/pending-chats');
      const chats = res.data.response ?? [];
      const isChatStillExists = chats?.filter(function (e: any) {
        return e.id === selectedChatId;
      });
      if (isChatStillExists.length === 0 && pendingChats.length > 0) {
        setTimeout(function () {
          setPendingChats(chats);
        }, 3000);
      } else {
        setPendingChats(chats);
      }
    };

    const events = sse(`/chat-list`, onMessage);

    return () => {
      events.close();
    };
  }, []);

  const { data: csaNameVisiblity } = useQuery<{ isVisible: boolean }>({
    queryKey: ['csa/name-visibility', 'prod'],
  });

  const { data: csaTitleVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['csa/title-visibility', 'prod'],
  });

  const groupedPendingChats: GroupedPendingChat = useMemo(() => {
    const grouped: GroupedPendingChat = {
      newChats: [],
      inProcessChats: [],
      myChats: [],
      otherChats: [],
    };

    if (!pendingChats) return grouped;

    if (chatCsaActive === true) {
      pendingChats.forEach((c) => {
        if (c.customerSupportId === 'chatbot') {
          grouped.newChats.push(c);
          return;
        } else {
          grouped.inProcessChats.push(c);
          pendingChats.forEach((c) => {
            if (c.customerSupportId === userInfo?.idCode) {
              grouped.myChats.push(c);
              return;
            }

            grouped.myChats.sort((a, b) => a.created.localeCompare(b.created));
            const groupIndex = grouped.otherChats.findIndex(
              (x) => x.groupId === c.customerSupportId
            );
            if (c.customerSupportId !== '') {
              if (groupIndex === -1) {
                grouped.otherChats.push({
                  groupId: c.customerSupportId ?? '',
                  name: c.customerSupportDisplayName ?? '',
                  chats: [c],
                });
              } else {
                grouped.otherChats[groupIndex].chats.push(c);
              }
            }
          });

          grouped.otherChats.sort((a, b) => a.name.localeCompare(b.name));
          return;
        }
      });
    }
    return grouped;
  }, [pendingChats, chatCsaActive]);

  const handleCsaForward = async (chat: ChatType, user: User) => {
    try {
      await apiDev.post('chat/redirect-chat', {
        id: chat.id ?? '',
        customerSupportId: user?.idCode ?? '',
        customerSupportDisplayName: user?.displayName ?? '',
        csaTitle: user?.csaTitle ?? '',
        forwardedByUser: userInfo?.displayName ?? '',
        forwardedFromCsa: userInfo?.displayName ?? '',
        forwardedToCsa: user?.displayName ?? '',
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
      await apiDev.post('chat/end-chat', {
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
    <Tabs.Root
      className="vertical-tabs"
      orientation="vertical"
      onValueChange={useStore.getState().setSelectedChatId}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      <Tabs.List
        className="vertical-tabs__list"
        aria-label={t('chat.active.list') || ''}
        style={{ overflow: 'auto' }}
      >
        <div className="vertical-tabs__group-header">
          <p>{`${t('chat.new')} ${
            (groupedPendingChats?.newChats?.length ?? 0) == 0
              ? ''
              : `(${groupedPendingChats?.newChats?.length ?? 0})`
          }`}</p>
        </div>
        {groupedPendingChats?.newChats?.map((chat) => (
          <Tabs.Trigger
            key={chat.id}
            className={clsx('vertical-tabs__trigger')}
            value={chat.id}
            style={{ borderBottom: '1px solid #D2D3D8' }}
          >
            <ChatTrigger chat={chat} />
          </Tabs.Trigger>
        ))}

        <div className="vertical-tabs__group-header">
          <p>{`${t('chat.inProcess')} ${
            (groupedPendingChats?.inProcessChats?.length ?? 0) == 0
              ? ''
              : `(${groupedPendingChats?.inProcessChats?.length ?? 0})`
          }`}</p>
        </div>
        {groupedPendingChats?.myChats?.map((chat) => (
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
        {groupedPendingChats?.otherChats?.map(({ name, chats }) => (
          <div key={uuidv4()}>
            {name && (
              <div className="vertical-tabs__sub-group-header">
                <p>{`${name} (${chats.length ?? 0})`}</p>
              </div>
            )}
            <Track align="stretch" direction="vertical" justify="between">
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
            </Track>
          </div>
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
    </Tabs.Root>
  );
};

export default ChatPending;
