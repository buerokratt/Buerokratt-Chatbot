import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceStrict } from 'date-fns';
import { et } from 'date-fns/locale';

import { Track, Chat, Dialog, Button, FormRadios } from 'components';
import { CHAT_EVENTS, Chat as ChatType } from 'types/chat';
import useUserInfoStore from 'store/store';
import { User } from 'types/user';
import { useToast } from 'hooks/useToast';
import './ChatUnanswered.scss';
import apiDev from 'services/api-dev';
import { format } from 'timeago.js';

const ChatUnanswered: FC = () => {
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
  const { data: activeChats } = useQuery<ChatType[]>({
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

  const selectedChat = useMemo(
    () =>
      activeChatsList && activeChatsList.find((c) => c.id === selectedChatId),
    [activeChatsList, selectedChatId]
  );
  const unansweredChats = useMemo(
    () =>
      activeChatsList
        ? activeChatsList.filter((c) => c.customerSupportId === '')
        : [],
    [activeChatsList]
  );

  const handleCsaForward = (chat: ChatType, user: User) => {
    // TODO: Add endpoint for chat forwarding
    setForwardToColleaugeModal(null);
    toast.open({
      type: 'success',
      title: t('global.notification'),
      message: `Chat forwarded to ${user.displayName}`,
    });
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
          <p>{t('chat.unansweredChats')}</p>
        </div>
        {unansweredChats.map((chat) => (
          <Tabs.Trigger
            key={chat.id}
            className="vertical-tabs__trigger"
            value={chat.id}
            style={{ borderBottom: '1px solid #D2D3D8' }}
          >
            <div style={{ fontSize: 14, lineHeight: '1.5', color: '#09090B' }}>
              <Track justify="between">
                {chat.endUserFirstName !== '' && chat.endUserLastName !== '' ? (
                  <p>
                    <strong>
                      {chat.endUserFirstName} {chat.endUserLastName}
                    </strong>
                  </p>
                ) : (
                  <p>
                    <strong>{t('global.anonymous')}</strong>
                  </p>
                )}
                {chat.lastMessageTimestamp && (
                  <p style={{ color: '#4D4F5D' }}>
                    {format(
                      chat.lastMessageTimestamp ?? new Date().toISOString,
                      'et_EE'
                    )}
                  </p>
                )}
              </Track>
              <div className="wrapper">
                <p className="last_message">{chat.lastMessage}.</p>
              </div>
            </div>
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
