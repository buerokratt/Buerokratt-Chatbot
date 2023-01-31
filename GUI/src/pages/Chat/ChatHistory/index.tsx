import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { AxiosError } from 'axios';
import { MdMailOutline, MdOutlineRemoveRedEye } from 'react-icons/md';

import { Button, Card, DataTable, Dialog, Drawer, FormInput, HistoricalChat, Icon } from 'components';
import { Chat as ChatType, CHAT_STATUS } from 'types/chat';
import { Message } from 'types/message';
import { useToast } from 'hooks/useToast';
import api from 'services/api';

const ChatHistory: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(null);
  const [statusChangeModal, setStatusChangeModal] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data: endedChats } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-ended-chats'],
  });
  const { data: chatMessages } = useQuery<Message[]>({
    queryKey: ['cs-get-messages-by-chat-id', selectedChat?.id],
    enabled: !!selectedChat,
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

  const chatStatusChangeMutation = useMutation({
    mutationFn: (data: { chatId: string | number, event: string }) => api.post('cs-end-chat', data),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: 'Chat status changed',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setStatusChangeModal(null),
  });

  const columnHelper = createColumnHelper<ChatType>();

  const endedChatsColumns = useMemo(() => [
    columnHelper.accessor('created', {
      header: t('chat.history.startTime') || '',
      cell: (props) => format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss'),
    }),
    columnHelper.accessor('ended', {
      header: t('chat.history.endTime') || '',
      cell: (props) => format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss'),
    }),
    columnHelper.accessor('customerSupportDisplayName', {
      header: t('chat.history.csaName') || '',
    }),
    columnHelper.accessor((row) => `${row.endUserFirstName} ${row.endUserLastName}`, {
      header: t('global.name') || '',
    }),
    columnHelper.accessor('customerSupportId', {
      header: t('global.idCode') || '',
    }),
    columnHelper.accessor('contactsMessage', {
      header: t('chat.history.contact') || '',
      cell: (props) => props.getValue()
        ? t('global.yes')
        : t('global.no'),
    }),
    columnHelper.accessor('status', {
      header: t('global.status') || '',
      cell: (props) => props.getValue() === CHAT_STATUS.ENDED ? t('chat.status.ended') : '',
    }),
    columnHelper.accessor('id', {
      header: 'ID',
    }),
    columnHelper.display({
      id: 'detail',
      cell: (props) => (
        <Button appearance='text' onClick={() => setSelectedChat(props.row.original)}>
          <Icon icon={<MdOutlineRemoveRedEye color={'rgba(0,0,0,0.54)'} />} />
          {t('global.view')}
        </Button>
      ),
      meta: {
        size: '1%',
      },
    }),
    columnHelper.display({
      id: 'forward',
      cell: (props) => (
        <Button appearance='text' onClick={() => setSendToEmailModal(props.row.original)}>
          <Icon icon={<MdMailOutline color={'rgba(0,0,0,0.54)'} />} />
          {t('chat.active.sendToEmail')}
        </Button>
      ),
      meta: {
        size: '1%',
      },
    }),
  ], []);

  const handleChatStatusChange = (event: string) => {
    if (!selectedChat) return;
    chatStatusChangeMutation.mutate({ chatId: selectedChat.id, event });
  };

  if (!endedChats) return <>Loading...</>;

  return (
    <>
      <h1>{t('chat.history.title')}</h1>

      <Card>
        <FormInput
          label={t('chat.history.searchChats')}
          hideLabel
          name='searchChats'
          placeholder={t('chat.history.searchChats') + '...'}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Card>

      <Card>
        <DataTable
          data={endedChats}
          columns={endedChatsColumns}
          globalFilter={filter}
          setGlobalFilter={setFilter}
          pagination={pagination}
          setPagination={setPagination}
        />
      </Card>

      {selectedChat && chatMessages && (
        <Drawer
          title={selectedChat.endUserFirstName !== '' && selectedChat.endUserLastName !== ''
            ? `${selectedChat.endUserFirstName} ${selectedChat.endUserLastName}`
            : t('global.anonymous')}
          onClose={() => setSelectedChat(null)}
        >
          <HistoricalChat chat={selectedChat} onChatStatusChange={setStatusChangeModal} />
        </Drawer>
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

      {statusChangeModal && (
        <Dialog
          title={t('chat.active.sendToEmail')}
          onClose={() => setSendToEmailModal(null)}
          footer={
            <>
              <Button appearance='secondary' onClick={() => setSendToEmailModal(null)}>{t('global.no')}</Button>
              <Button
                appearance='error'
                onClick={() => handleChatStatusChange(statusChangeModal)}
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

export default ChatHistory;
