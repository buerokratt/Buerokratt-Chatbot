import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceStrict } from 'date-fns';
import { et } from 'date-fns/locale';

import { Track, Chat, Dialog, Button, FormRadios } from 'components';
import {
  CHAT_EVENTS,
  CHAT_STATUS,
  Chat as ChatType,
  GroupedChat,
} from 'types/chat';
import useUserInfoStore from 'store/store';
import { User } from 'types/user';
import { useToast } from 'hooks/useToast';
import './ChatUnanswered.scss';
import apiDev from 'services/api-dev';
import { format } from 'timeago.js';
import CsaActivityContext from 'providers/CsaActivityContext';
import ChatTrigger from '../ChatActive/ChatTrigger';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import ForwardToColleaugeModal from '../ForwardToColleaugeModal';
import ForwardToEstablishmentModal from '../ForwardToEstablishmentModal';
import sse from 'services/sse-service';

const ChatUnanswered: FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const toast = useToast();
  const { chatCsaActive } = useContext(CsaActivityContext);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [endChatModal, setEndChatModal] = useState<ChatType | null>(null);
  const [forwardToColleaugeModal, setForwardToColleaugeModal] =
    useState<ChatType | null>(null);
  const [forwardToEstablishmentModal, setForwardToEstablishmentModal] =
    useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(
    null
  );
  const [activeChatsList, setActiveChatsList] = useState<ChatType[]>([]);
  const [selectedEndChatStatus, setSelectedEndChatStatus] = useState<
    string | null
  >(null);
  const CSAchatStatuses = [
    CHAT_EVENTS.ACCEPTED,
    CHAT_EVENTS.HATE_SPEECH,
    CHAT_EVENTS.OTHER,
    CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL,
  ];

  const { refetch } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-active-chats', 'prod'],
    onSuccess(res: any) {
      setActiveChatsList(res.data.get_all_active_chats);
    },
  });

  useEffect(() => {
    const sseInstance = sse(`cs-get-all-active-chats`);
    sseInstance.onMessage((chats: any) => {
      const isChatStillExists = chats?.filter(function (e: any) {
        return e.id === selectedChatId;
      });
      if (isChatStillExists.length === 0 && activeChatsList.length > 0) {
        setTimeout(function () {
          setActiveChatsList(chats);
        }, 3000);
      } else {
        setActiveChatsList(chats);
      }
    });
    return () => sseInstance.close();
  }, []);

  useEffect(() => {
    refetch();
  }, [chatCsaActive]);

  const { data: csaNameVisiblity } = useQuery<{ isVisible: boolean }>({
    queryKey: ['cs-get-csa-name-visibility', 'prod-2'],
  });

  const { data: csaTitleVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['cs-get-csa-title-visibility', 'prod-2'],
  });

  const selectedChat = useMemo(
    () =>
      activeChatsList && activeChatsList.find((c) => c.id === selectedChatId),
    [activeChatsList, selectedChatId]
  );

  const unansweredChats: GroupedChat = useMemo(() => {
    const grouped: GroupedChat = {
      myChats: [],
      otherChats: [],
    };

    if (!activeChatsList) return grouped;

    const filteredActiveChatsList = activeChatsList;
    if (chatCsaActive === true) {
      filteredActiveChatsList.filter((c) => c.customerSupportId === '');
    }

    if (chatCsaActive === true) {
      filteredActiveChatsList.forEach((c) => {
        if (c.customerSupportId === '') {
          grouped.myChats.push(c);
          return;
        }
      });
    } else {
      filteredActiveChatsList.forEach((c) => {
        if (
          c.customerSupportId === userInfo?.idCode ||
          c.customerSupportId === ''
        ) {
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
    }

    return grouped;
  }, [activeChatsList, chatCsaActive]);

  const handleCsaForward = async (chat: ChatType, user: User) => {
    try {
      await apiDev.post('cs-redirect-chat', {
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
          <p>{`${t('chat.unansweredChats')} ${
            (unansweredChats?.myChats?.length ?? 0) == 0
              ? ''
              : `(${unansweredChats?.myChats?.length ?? 0})`
          }`}</p>
        </div>
        {unansweredChats?.myChats?.map((chat) => (
          <Tabs.Trigger
            key={chat.id}
            className={clsx('vertical-tabs__trigger', {
              active:
                chat.status === CHAT_STATUS.REDIRECTED &&
                chat.customerSupportId === userInfo?.idCode &&
                chat.lastMessageEvent === 'redirected',
            })}
            value={chat.id}
            style={{ borderBottom: '1px solid #D2D3D8' }}
          >
            <ChatTrigger chat={chat} />
          </Tabs.Trigger>
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

export default ChatUnanswered;
