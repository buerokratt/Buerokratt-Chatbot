import { FC, useEffect, useMemo, useState } from 'react';
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
import { CHAT_EVENTS, CHAT_STATUS, Chat as ChatType } from 'types/chat';
import { Message } from 'types/message';
import { useToast } from 'hooks/useToast';
import apiDev from 'services/api-dev';
import useUserInfoStore from '../../../store/store';
import { Controller, useForm } from 'react-hook-form';
import {
  getFromLocalStorage,
  setToLocalStorage,
} from 'utils/local-storage-utils';
import { CHAT_HISTORY_PREFERENCES_KEY } from '../../../constants/config';
import apiDevV2 from 'services/api-dev-v2';
import { useLocation } from 'react-router-dom';

const ChatHistory: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { userInfo } = useUserInfoStore();
  const routerLocation = useLocation();
  let passedChatId = new URLSearchParams(routerLocation.search).get('chat');
  const preferences = getFromLocalStorage(
    CHAT_HISTORY_PREFERENCES_KEY
  ) as string[];
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [sendToEmailModal, setSendToEmailModal] = useState<ChatType | null>(
    null
  );
  const [statusChangeModal, setStatusChangeModal] = useState<string | null>(
    null
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [endedChatsList, setEndedChatsList] = useState<ChatType[]>([]);
  const [filteredEndedChatsList, setFilteredEndedChatsList] = useState<
    ChatType[]
  >([]);
  const [chatMessagesList, setchatMessagesList] = useState<Message[]>([]);
  const [messagesTrigger, setMessagesTrigger] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    preferences ?? []
  );
  const { control, watch } = useForm<{
    startDate: Date | string;
    endDate: Date | string;
  }>({
    defaultValues: {
      startDate: new Date(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate()
      ),
      endDate: new Date(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate() + 1
      ),
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (passedChatId != null) {
      getChatById.mutate();
      passedChatId = null;
    }
  }, [passedChatId]);

  useEffect(() => {
    getAllEndedChats.mutate({
      startDate: format(new Date(startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(endDate), 'yyyy-MM-dd'),
    });
  }, []);

  const getAllEndedChats = useMutation({
    mutationFn: (data: { startDate: string; endDate: string }) =>
      apiDev.post('cs-get-all-ended-chats', {
        startDate: data.startDate,
        endDate: data.endDate,
      }),
    onSuccess: (res: any) => {
      setEndedChatsList(res.data.data.cs_get_all_ended_chats ?? []);
      filterChatsList(res.data.data.cs_get_all_ended_chats ?? []);
    },
  });

  const getChatById = useMutation({
    mutationFn: () =>
      apiDevV2.post('cs-get-chat-by-id', {
        chatId: passedChatId,
      }),
    onSuccess: (res: any) => {
      setSelectedChat(res.data.response);
    },
  });

  useQuery<Message[]>({
    queryKey: ['cs-get-messages-by-chat-id', selectedChat?.id, 'prod'],
    enabled: !!selectedChat,
    onSuccess(res: any) {
      setchatMessagesList(res.data.cs_get_messages_by_chat_id);
    },
  });

  const visibleColumnOptions = useMemo(
    () => [
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
    ],
    [t]
  );

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

  const searchChatsMutation = useMutation({
    mutationFn: (searchKey: string) =>
      apiDev.post('cs-get-chat-ids-matching-message-search', {
        searchKey: searchKey,
      }),
    onSuccess: (res) => {
      const responseList = (
        res.data.data.get_chat_ids_matching_message_search ?? []
      ).map((item: any) => item.chatId);
      const filteredChats = endedChatsList.filter((item) =>
        responseList.includes(item.id)
      );
      filterChatsList(filteredChats);
    },
  });

  const chatStatusChangeMutation = useMutation({
    mutationFn: async (data: { chatId: string | number; event: string }) => {
      const changeableTo = [
        CHAT_EVENTS.CLIENT_LEFT_WITH_ACCEPTED.toUpperCase(),
        CHAT_EVENTS.CLIENT_LEFT_WITH_NO_RESOLUTION.toUpperCase(),
        CHAT_EVENTS.ACCEPTED.toUpperCase(),
        CHAT_EVENTS.ANSWERED.toUpperCase(),
        CHAT_EVENTS.CLIENT_LEFT_FOR_UNKNOWN_REASONS.toUpperCase(),
        CHAT_EVENTS.CLIENT_LEFT.toUpperCase(),
        CHAT_EVENTS.HATE_SPEECH.toUpperCase(),
        CHAT_EVENTS.OTHER.toUpperCase(),
        CHAT_EVENTS.TERMINATED.toUpperCase(),
        CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL.toUpperCase(),
      ];
      const isChangeable = changeableTo.includes(data.event);

      if (selectedChat?.lastMessageEvent === data.event.toLowerCase()) return;

      if (!isChangeable) return;

      await apiDev.post('cs-end-chat', {
        chatId: selectedChat!.id,
        event: data.event.toUpperCase(),
        authorTimestamp: new Date().toISOString(),
        authorFirstName: userInfo!.firstName,
        authorId: userInfo!.idCode,
        authorRole: userInfo!.authorities,
      });
    },
    onSuccess: () => {
      setMessagesTrigger(!messagesTrigger);
      getAllEndedChats.mutate({
        startDate: format(new Date(startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(endDate), 'yyyy-MM-dd'),
      });
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.chatStatusChanged'),
      });
      setStatusChangeModal(null);
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
    mutationFn: (data: { chatId: string | number; comment: string }) =>
      apiDevV2.post('comments/comment-history', data),
    onSuccess: (res, { chatId, comment }) => {
      const updatedChatList = endedChatsList.map((chat) =>
        chat.id === chatId ? { ...chat, comment } : chat
      );
      filterChatsList(updatedChatList);
      if (selectedChat) setSelectedChat({ ...selectedChat, comment });
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.chatCommentChanged'),
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

  const copyValueToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);

    toast.open({
      type: 'success',
      title: t('global.notification'),
      message: t('toast.succes.copied'),
    });
  };

  const endedChatsColumns = useMemo(
    () => [
      columnHelper.accessor('created', {
        id: 'created',
        header: t('chat.history.startTime') || '',
        cell: (props) =>
          format(new Date(props.getValue()), 'd. MMM yyyy HH:mm:ss'),
      }),
      columnHelper.accessor('ended', {
        id: 'ended',
        header: t('chat.history.endTime') || '',
        cell: (props) =>
          format(new Date(props.getValue()), 'd. MMM yyyy HH:mm:ss'),
      }),
      columnHelper.accessor('customerSupportDisplayName', {
        id: 'customerSupportDisplayName',
        header: t('chat.history.csaName') || '',
      }),
      columnHelper.accessor(
        (row) => `${row.endUserFirstName} ${row.endUserLastName}`,
        {
          id: `endUserName`,
          header: t('global.name') || '',
        }
      ),
      columnHelper.accessor('endUserId', {
        id: 'endUserId',
        header: t('global.idCode') || '',
      }),
      columnHelper.accessor('contactsMessage', {
        id: 'contactsMessage',
        header: t('chat.history.contact') || '',
        cell: (props) => (props.getValue() ? t('global.yes') : t('global.no')),
      }),
      columnHelper.accessor('comment', {
        id: 'comment',
        header: t('chat.history.comment') || '',
        cell: (props) =>
          !props.getValue() ? (
            <></>
          ) : (
            <Tooltip content={props.getValue()}>
              <span>
                {props.getValue() === undefined
                  ? ''
                  : props.getValue()?.slice(0, 30) + '...'}
              </span>
            </Tooltip>
          ),
      }),
      columnHelper.accessor('labels', {
        id: 'labels',
        header: t('chat.history.label') || '',
      }),
      // columnHelper.accessor('nps', {
      //   header: 'NPS',
      // }),
      columnHelper.accessor('status', {
        id: 'status',
        header: t('global.status') || '',
        cell: (props) =>
          props.getValue() === CHAT_STATUS.ENDED
            ? props.row.original.lastMessageEvent != null &&
              props.row.original.lastMessageEvent !== 'message-read'
              ? t(
                  'chat.plainEvents.' + props.row.original.lastMessageEvent ??
                    ''
                )
              : t('chat.status.ended')
            : '',
      }),
      columnHelper.accessor('id', {
        id: 'id',
        header: 'ID',
        cell: (props) => (
          <button onClick={() => copyValueToClipboard(props.getValue())}>
            {props.getValue()}
          </button>
        ),
      }),
      columnHelper.display({
        id: 'detail',
        cell: (props) => (
          <Button
            appearance="text"
            onClick={() => setSelectedChat(props.row.original)}
          >
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
          <Button
            appearance="text"
            onClick={() => setSendToEmailModal(props.row.original)}
          >
            <Icon icon={<MdMailOutline color={'rgba(0,0,0,0.54)'} />} />
            {t('chat.active.sendToEmail')}
          </Button>
        ),
        meta: {
          size: '1%',
        },
      }),
    ],
    []
  );

  const handleChatStatusChange = (event: string) => {
    if (!selectedChat) return;
    chatStatusChangeMutation.mutate({
      chatId: selectedChat.id,
      event: event.toUpperCase(),
    });
  };

  const handleCommentChange = (comment: string) => {
    if (!selectedChat) return;
    chatCommentChangeMutation.mutate({ chatId: selectedChat.id, comment });
  };

  const getFilteredColumns = () => {
    if (selectedColumns.length === 0) return endedChatsColumns;
    return endedChatsColumns.filter((c) =>
      ['detail', 'forward', ...selectedColumns].includes(c.id ?? '')
    );
  };

  const filterChatsList = (chatsList: ChatType[]) => {
    const startDate = Date.parse(
      format(new Date(control._formValues.startDate), 'MM/dd/yyyy')
    );

    const endDate = Date.parse(
      format(new Date(control._formValues.endDate), 'MM/dd/yyyy')
    );

    setFilteredEndedChatsList(
      chatsList.filter((c) => {
        const created = Date.parse(format(new Date(c.created), 'MM/dd/yyyy'));
        return created >= startDate && created <= endDate;
      })
    );
  };

  if (!filteredEndedChatsList) return <>Loading...</>;

  return (
    <>
      <h1>{t('chat.history.title')}</h1>

      <Card>
        <Track gap={16}>
          <FormInput
            label={t('chat.history.searchChats')}
            hideLabel
            name="searchChats"
            placeholder={t('chat.history.searchChats') + '...'}
            onChange={(e) =>
              e.target.value.length === 0
                ? filterChatsList(endedChatsList)
                : searchChatsMutation.mutate(e.target.value)
            }
          />
          <Track style={{ width: '100%' }} gap={16}>
            <Track gap={10}>
              <p>{t('global.from')}</p>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => {
                  return (
                    <FormDatepicker
                      {...field}
                      label={''}
                      value={field.value ?? new Date()}
                      onChange={(v) => {
                        field.onChange(v);
                        getAllEndedChats.mutate({
                          startDate: format(new Date(v), 'yyyy-MM-dd'),
                          endDate: format(new Date(endDate), 'yyyy-MM-dd'),
                        });
                      }}
                    />
                  );
                }}
              />
            </Track>
            <Track gap={10}>
              <p>{t('global.to')}</p>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => {
                  return (
                    <FormDatepicker
                      {...field}
                      label={''}
                      value={field.value ?? new Date()}
                      onChange={(v) => {
                        field.onChange(v);
                        getAllEndedChats.mutate({
                          startDate: format(new Date(startDate), 'yyyy-MM-dd'),
                          endDate: format(new Date(v), 'yyyy-MM-dd'),
                        });
                      }}
                    />
                  );
                }}
              />
            </Track>
            <FormMultiselect
              name="visibleColumns"
              label={t('')}
              options={visibleColumnOptions}
              selectedOptions={visibleColumnOptions.filter((o) =>
                selectedColumns.includes(o.value)
              )}
              onSelectionChange={(selection) => {
                const columns = selection?.map((s) => s.value) ?? [];
                setSelectedColumns(columns);
                setToLocalStorage(CHAT_HISTORY_PREFERENCES_KEY, columns);
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
          title={
            selectedChat.endUserFirstName !== '' &&
            selectedChat.endUserLastName !== ''
              ? `${selectedChat.endUserFirstName} ${selectedChat.endUserLastName}`
              : t('global.anonymous')
          }
          onClose={() => setSelectedChat(null)}
        >
          <HistoricalChat
            chat={selectedChat}
            trigger={messagesTrigger}
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

      {statusChangeModal && (
        <Dialog
          title={t('chat.changeStatus')}
          onClose={() => setSendToEmailModal(null)}
          footer={
            <>
              <Button
                appearance="secondary"
                onClick={() => setStatusChangeModal(null)}
              >
                {t('global.cancel')}
              </Button>
              <Button
                appearance="error"
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
