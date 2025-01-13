import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';

import { Chat, Dialog, Button, FormRadios, Track } from 'components';
import { CHAT_EVENTS, CHAT_STATUS, Chat as ChatType } from 'types/chat';
import { User } from 'types/user';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import ChatTrigger from '../ChatActive/ChatTrigger';
import clsx from 'clsx';
import ForwardToColleaugeModal from '../ForwardToColleaugeModal';
import ForwardToEstablishmentModal from '../ForwardToEstablishmentModal';
import { v4 as uuidv4 } from 'uuid';
import './ChatPending.scss';
import { userStore as useHeaderStore } from '@buerokratt-ria/header';
import useStore from 'store';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';

const ChatPending: FC = () => {
  const { t } = useTranslation();
  const userInfo = useStore((state) => state.userInfo);
  const toast = useToast();
  const [endChatModal, setEndChatModal] = useState<ChatType | null>(null);
  const [forwardToColleaugeModal, setForwardToColleaugeModal] =
    useState<ChatType | null>(null);
  const [forwardToEstablishmentModal, setForwardToEstablishmentModal] =
    useState<ChatType | null>(null);

  const [selectedEndChatStatus, setSelectedEndChatStatus] = useState<
    string | null
  >(null);
  const CSAchatStatuses = [
    CHAT_EVENTS.ACCEPTED,
    CHAT_EVENTS.HATE_SPEECH,
    CHAT_EVENTS.OTHER,
    CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL,
  ];

  const selectedChatId = useHeaderStore((state) => state.selectedChatId);
  const selectedChat = useHeaderStore((state) => state.selectedPendingChat());

  const loadPendingChats = useHeaderStore((state) => state.loadPendingChats);

  useEffect(() => {
    useHeaderStore.getState().loadPendingChats();
  }, []);

  const { data: csaNameVisiblity } = useQuery<{ isVisible: boolean }>({
    queryKey: ['agents/admin/name-visibility', 'prod'],
  });

  const { data: csaTitleVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['agents/admin/title-visibility', 'prod'],
  });

  const groupedPendingChats = useHeaderStore((state) =>
    state.getGroupedPendingChats()
  );

  const handleCsaForward = async (chat: ChatType, user: User) => {
    try {
      await apiDev.post('chats/redirect', {
        id: chat.id ?? '',
        customerSupportId: user?.idCode ?? '',
        customerSupportDisplayName: user?.displayName ?? '',
        csaTitle: user?.csaTitle ?? '',
        forwardedByUser: userInfo?.displayName ?? '',
        forwardedFromCsa: userInfo?.displayName ?? '',
        forwardedToCsa: user?.displayName ?? '',
      });
      setForwardToColleaugeModal(null);
      loadPendingChats();
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: `${t('chat.chatForwardedTo')} ${user.displayName}`,
      });
    } catch (error) {
      toast.open({
        type: 'warning',
        title: t('global.notificationError'),
        message: t('chat.chatEnded'),
      });
    }
  };

  const handleEstablishmentForward = (
    chat: ChatType,
    establishment: string
  ) => {
    // To be added: Add endpoint for chat forwarding
    setForwardToEstablishmentModal(null);
    toast.open({
      type: 'success',
      title: t('global.notification'),
      message: `${t('chat.chatForwardedTo')} ${establishment}`,
    });
  };

  const handleChatEnd = async () => {
    if (!selectedEndChatStatus) return;

    try {
      await apiDev.post('chats/end', {
        chatId: selectedChatId,
        event: selectedEndChatStatus.toUpperCase(),
        authorTimestamp: new Date().toISOString(),
        authorFirstName: userInfo!.firstName,
        authorId: userInfo!.idCode,
        authorRole: userInfo!.authorities,
      });
      loadPendingChats();
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('chat.chatEnded'),
      });
    } catch (error) {
      toast.open({
        type: 'warning',
        title: t('global.notificationError'),
        message: t('chat.chatEnded'),
      });
    }
    setEndChatModal(null);
    setSelectedEndChatStatus(null);
  };

  return (
    <Tabs.Root
      className="vertical-tabs"
      orientation="vertical"
      onValueChange={useHeaderStore.getState().setSelectedChatId}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      <Tabs.List
        className="vertical-tabs__list"
        aria-label={t('chat.active.list') ?? ''}
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
              onSendToEmail={() => {}} // To be added when endpoint is ready
              onRefresh={loadPendingChats}
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

export default withAuthorization(ChatPending, [
  ROLES.ROLE_ADMINISTRATOR,
  ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
]);
