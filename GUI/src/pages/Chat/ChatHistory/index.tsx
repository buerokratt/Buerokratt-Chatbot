import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { AxiosError } from 'axios';
import { MdMailOutline, MdOutlineRemoveRedEye } from 'react-icons/md';

import {
  Button,
  Card,
  DataTable,
  Dialog,
  Drawer,
  FormDatepicker,
  FormInput,
  FormMultiselect,
  HistoricalChat,
  Icon,
  Tooltip,
  Track,
} from 'components';
import { Chat as ChatType, CHAT_STATUS } from 'types/chat';
import { Message } from 'types/message';
import { useToast } from 'hooks/useToast';
import api from 'services/api';
import apiDev from 'services/api-dev';
import { Controller, useForm } from 'react-hook-form';
import { getFromLocalStorage, setToLocalStorage } from 'utils/local-storage-utils';
import { CHAT_HISTORY_PREFERENCES_KEY } from '../../../constants/config'

const ChatHistory: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const preferences = getFromLocalStorage(CHAT_HISTORY_PREFERENCES_KEY) as string[];
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(null);
  const [statusChangeModal, setStatusChangeModal] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [endedChatsList, setEndedChatsList] = useState<ChatType[]>([]);
  const [filteredEndedChatsList, setFilteredEndedChatsList] = useState<ChatType[]>([]);
  const [chatMessagesList, setchatMessagesList] = useState<Message[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(preferences ?? []);
  const { control } = useForm<{
    startDate: Date | string;
    endDate: Date | string;
  }>({
    defaultValues: {
      startDate: new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()),
      endDate: new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + 1),
    }
  });

  const { data: endedChats } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-ended-chats', 'prod'],
    onSuccess(res: any) {
      setEndedChatsList(res.data.cs_get_all_ended_chats ?? []);
      filterChatsList(res.data.cs_get_all_ended_chats ?? [])
    },
  });
  const { data: chatMessages } = useQuery<Message[]>({
    queryKey: ['cs-get-messages-by-chat-id', selectedChat?.id, 'prod'],
    enabled: !!selectedChat,
    onSuccess(res: any) {
      setchatMessagesList(res.data.cs_get_messages_by_chat_id);

    },
  });

  const visibleColumnOptions = useMemo(() => [
    { label: t('chat.history.startTime'), value: 'created' },
    { label: t('chat.history.endTime'), value: 'ended' },
    { label: t('chat.history.csaName'), value: 'customerSupportDisplayName' },
    { label: t('global.name'), value: 'endUserName' },
    { label: t('global.idCode'), value: 'endUserId' },
    { label: t('chat.history.contact'), value: 'contactsMessage' },
    { label: t('chat.history.comment'), value: 'comment' },
    { label: t('chat.history.label'), value: 'labels' },
    // { label: t('chat.history.nps'), value: 'nps' },
    { label: t('global.status'), value: 'status' },
    { label: 'ID', value: 'id' },
  ], [t]);

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

  const searchChatsMutation = useMutation({
    mutationFn: (searchKey: string) => apiDev.post('cs-get-chat-ids-matching-message-search', {
      'searchKey': searchKey
    }),
    onSuccess: (res) => {
      const responseList = (res.data.data.get_chat_ids_matching_message_search ?? []).map((item: any) => item.chatId);
      const filteredChats = endedChatsList.filter(item => responseList.includes(item.id));
      filterChatsList(filteredChats);
    }
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

  const chatCommentChangeMutation = useMutation({
    mutationFn: (data: { chatId: string | number, comment: string }) => api.post('cs-comment-history', data),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: 'Chat comment changed',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const columnHelper = createColumnHelper<ChatType>();

  const endedChatsColumns = useMemo(() => [
    columnHelper.accessor('created', {
      id: 'created',
      header: t('chat.history.startTime') || '',
      cell: (props) => format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss'),
    }),
    columnHelper.accessor('ended', {
      id: 'ended',
      header: t('chat.history.endTime') || '',
      cell: (props) => format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss'),
    }),
    columnHelper.accessor('customerSupportDisplayName', {
      id: 'customerSupportDisplayName',
      header: t('chat.history.csaName') || '',
    }),
    columnHelper.accessor((row) => `${row.endUserFirstName} ${row.endUserLastName}`, {
      id: `endUserName`,
      header: t('global.name') || '',
    }),
    columnHelper.accessor('endUserId', {
      id: 'endUserId',
      header: t('global.idCode') || '',
    }),
    columnHelper.accessor('contactsMessage', {
      id: 'contactsMessage',
      header: t('chat.history.contact') || '',
      cell: (props) => props.getValue()
        ? t('global.yes')
        : t('global.no'),
    }),
    columnHelper.accessor('comment', {
      id: "comment",
      header: t('chat.history.comment') || '',
      cell: (props) => (
        <Tooltip content={props.getValue()}>
          <span>{props.getValue() === undefined ? '' : props.getValue()?.slice(0, 30) + '...'}</span>
        </Tooltip>
      ),
    }),
    columnHelper.accessor('labels', {
      id: 'labels',
      header: t('chat.history.label') || '',
      cell: (props) => <span></span>,
    }),
    // columnHelper.accessor('nps', {
    //   header: 'NPS',
    // }),
    columnHelper.accessor('status', {
      id: 'status',
      header: t('global.status') || '',
      cell: (props) => props.getValue() === CHAT_STATUS.ENDED ? t('chat.status.ended') : '',
    }),
    columnHelper.accessor('id', {
      id: 'id',
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

  const handleCommentChange = (comment: string) => {
    if (!selectedChat) return;
    chatCommentChangeMutation.mutate({ chatId: selectedChat.id, comment });
  };

  const getFilteredColumns = () => {
    if (selectedColumns.length === 0) return endedChatsColumns;
    return endedChatsColumns.filter((c) => ['detail', 'forward', ...selectedColumns].includes(c.id ?? ""))
  }

  const filterChatsList = (chatsList: ChatType[]) => {
    const startDate = control._formValues.startDate;
    const endDate = control._formValues.endDate;
    setFilteredEndedChatsList(chatsList.filter((c) => new Date(c.created) >= startDate && new Date(c.created) <= endDate ));
  }

  if (!filteredEndedChatsList) return <>Loading...</>;

  return (
    <>
      <h1>{t('chat.history.title')}</h1>

      <Card>
        <Track gap={16}>
          <FormInput
            label={t('chat.history.searchChats')}
            hideLabel
            name='searchChats'
            placeholder={t('chat.history.searchChats') + '...'}
            onChange={(e) => e.target.value.length === 0 ? filterChatsList(endedChatsList) : searchChatsMutation.mutate(e.target.value)}
          />
          <Track style={{width: '100%'}} gap={16}>
            <Track gap={10}>
              <p>{t("global.from")}</p>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => {
                  return (
                    <FormDatepicker
                    {...field}
                    label={""}
                    value={field.value ?? new Date()}
                    onChange={(v) => {
                      field.onChange(v);
                      filterChatsList(endedChatsList);
                    }}
                    />
                  );
                }}
              />
            </Track>
            <Track gap={10}>
              <p>{t("global.to")}</p>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => {
                  return (
                    <FormDatepicker
                      {...field}
                      label={""}
                      value={field.value ?? new Date()}
                      onChange={(v) => {
                        field.onChange(v);
                        filterChatsList(endedChatsList);
                      }}
                    />
                  );
                }}
              />
            </Track>
            <FormMultiselect
              name='visibleColumns'
              label={t('')}
              options={visibleColumnOptions}
              selectedOptions={visibleColumnOptions.filter((o) => selectedColumns.includes(o.value))}
              onSelectionChange={(selection) => {
                const columns = selection?.map((s) => s.value) ?? [];
                setSelectedColumns(columns);
                setToLocalStorage(CHAT_HISTORY_PREFERENCES_KEY, columns)
              }}
            />
          </Track>
        </Track>
      </Card>

      <Card>
        <DataTable
          data={filteredEndedChatsList}
          sortable
          columns={getFilteredColumns()}
          pagination={pagination}
          setPagination={setPagination}
        />
      </Card>

      {selectedChat && chatMessagesList && (
        <Drawer
          title={selectedChat.endUserFirstName !== '' && selectedChat.endUserLastName !== ''
            ? `${selectedChat.endUserFirstName} ${selectedChat.endUserLastName}`
            : t('global.anonymous')}
          onClose={() => setSelectedChat(null)}
        >
          <HistoricalChat
            chat={selectedChat}
            onChatStatusChange={setStatusChangeModal}
            onCommentChange={handleCommentChange}
          />
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
