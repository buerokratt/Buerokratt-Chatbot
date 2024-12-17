import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PaginationState,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { AiFillCheckCircle } from 'react-icons/ai';
import {
  Button,
  Card,
  DataTable,
  Drawer,
  HistoricalChat,
  Icon,
  Tooltip,
} from 'components';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { useMutation } from '@tanstack/react-query';
import { Message } from 'types/message';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import { AxiosError } from 'axios';
import { userStore as useHeaderStore } from '@buerokratt-ria/header';
import sse from 'services/sse-service';
import MessageContentView from './MessageContentView';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { Chat as ChatType } from 'types/chat';
import './ValidationRequests.scss';

const ValidationRequests: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const validationRequests = useHeaderStore((state) =>
    state.getValidationMessages()
  );

  const loadValidationMessages = useHeaderStore(
    (state) => state.loadValidationMessages
  );

  useEffect(() => {
    useHeaderStore.getState().loadValidationMessages();
  }, []);

  useEffect(() => {
    const events = sse(`/chat-list`, loadValidationMessages);
    return () => events.close();
  }, []);

  const approveMessage = useMutation({
    mutationFn: (data: { chatId: string; messageId: string }) => {
      return apiDev.post(`chats/messages/approve-validation`, {
        chatId: data.chatId,
        messageId: data.messageId,
      });
    },
    onSuccess: async () => {
      loadValidationMessages();
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('chat.validations.messageApproved'),
      });
      return true;
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
      return false;
    },
  });

  const columnHelper = createColumnHelper<Message>();

  const idView = (props: any) => (
    <Tooltip content={props.getValue()}>
      <button
        onClick={() => copyValueToClipboard(props.getValue())}
        style={{ cursor: 'pointer', fontSize: 16 }}
      >
        {props.getValue().split('-')[0]}
      </button>
    </Tooltip>
  );

  const approveView = (props: any) => (
    <Icon
      style={{ marginLeft: '15%', cursor: 'pointer' }}
      icon={
        <AiFillCheckCircle
          fontSize={22}
          color="#308653"
          onClick={() =>
            approveMessage.mutate({
              chatId: props.row.original.chatId,
              messageId: props.row.original.id ?? '',
            })
          }
        />
      }
      size="medium"
    />
  );

  const dateView = (props: any) => (
    <span>
      {format(new Date(props.getValue() ?? ''), 'dd-MM-yyyy HH:mm:ss')}
    </span>
  );

  const detailsView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => {
        const chat: any = {
          id: props.row.original.chatId,
        };
        setSelectedChat(chat);
      }}
    >
      <Icon icon={<MdOutlineRemoveRedEye color={'rgba(0,0,0,0.54)'} />} />
      {t('global.view')}
    </Button>
  );

  const copyValueToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);

    toast.open({
      type: 'success',
      title: t('global.notification'),
      message: t('toast.success.copied'),
    });
  };

  const validationColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        id: 'id',
        header: t('chat.validations.header.id') ?? '',
        cell: idView,
      }),
      columnHelper.accessor('chatId', {
        id: 'chatId',
        header: t('chat.validations.header.chatId') ?? '',
        cell: idView,
      }),
      columnHelper.accessor('content', {
        header: t('chat.validations.header.message') ?? '',
        cell: MessageContentView,
      }),
      columnHelper.accessor('created', {
        header: t('chat.validations.header.requestedAt') ?? '',
        cell: dateView,
      }),
      columnHelper.display({
        id: 'approve',
        header: t('chat.validations.header.approve') ?? '',
        cell: approveView,
      }),
      columnHelper.display({
        id: 'detail',
        cell: detailsView,
        meta: {
          size: '3%',
          sticky: 'right',
        },
      }),
    ],
    []
  );

  return (
    <>
      <h1>{t('chat.validations.title')}</h1>
      <p>{t('chat.validations.description')}</p>
      <div className="card-drawer-container">
        <div className="card-wrapper">
          <Card>
            <DataTable
              data={validationRequests ?? []}
              columns={validationColumns}
              sortable
              sorting={sorting}
              pagination={pagination}
              setPagination={(state: PaginationState) => {
                if (
                  state.pageIndex === pagination.pageIndex &&
                  state.pageSize === pagination.pageSize
                )
                  return;
                setPagination(state);
              }}
              setSorting={(state: SortingState) => {
                setSorting(state);
              }}
            />
          </Card>
        </div>
        {selectedChat && (
          <div className="drawer-container">
            <Drawer
              title={selectedChat.id}
              onClose={() => setSelectedChat(null)}
            >
              <HistoricalChat
                chat={selectedChat}
                trigger={false}
                onChatStatusChange={() => {}}
                selectedStatus={null}
                onCommentChange={() => {}}
                showComment={false}
                showStatus={false}
              />
            </Drawer>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthorization(ValidationRequests, [
  ROLES.ROLE_ADMINISTRATOR,
  ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
]);
