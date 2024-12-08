import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PaginationState,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  AiFillCheckCircle,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineEdit,
} from 'react-icons/ai';
import { Card, DataTable, FormInput, Icon, Tooltip, Track } from 'components';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Message } from 'types/message';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import { AxiosError } from 'axios';

const ValidationRequests: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: validationRequests } = useQuery<{ response: Message[] }>({
    queryKey: ['chats/messages/waiting-validation', 'prod'],
  });

  const approveMessage = useMutation({
    mutationFn: (data: { chatId: string; messageId: string }) => {
      return apiDev.post(`chats/messages/approve-validation`, {
        chatId: data.chatId,
        messageId: data.messageId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        'chats/messages/waiting-validation',
        'prod',
      ]);
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
      <span
        onClick={() => copyValueToClipboard(props.getValue())}
        style={{ cursor: 'pointer' }}
      >
        {props.getValue().split('-')[0]}
      </span>
    </Tooltip>
  );

  const contentView = (props: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(props.getValue());
    const [inputContent, setInputContent] = useState(content);

    return (
      <Track gap={10}>
        {!isEditing && <label>{content}</label>}
        {isEditing && (
          <div style={{ width: '50%' }}>
            <FormInput
              name={''}
              label={''}
              defaultValue={content}
              onChange={(e) => {
                setInputContent(e.target.value);
              }}
            ></FormInput>
          </div>
        )}
        {!isEditing && (
          <Icon
            style={{ cursor: 'pointer' }}
            icon={
              <AiOutlineEdit fontSize={22} onClick={() => setIsEditing(true)} />
            }
            size="medium"
          />
        )}
        {isEditing && (
          <Icon
            style={{ cursor: 'pointer' }}
            icon={
              <AiOutlineCheck
                fontSize={22}
                color="#308653"
                onClick={async () => {
                  if (inputContent.length === 0) return;
                  try {
                    await apiDev.post('chats/messages/edit', {
                      chatId: props.row.original.chatId,
                      messageId: props.row.original.id,
                      content: inputContent,
                    });
                    setIsEditing(false);
                    setContent(inputContent);
                    toast.open({
                      type: 'success',
                      title: t('global.notification'),
                      message: t('chat.validations.messageApproved'),
                    });
                  } catch (_) {
                    toast.open({
                      type: 'error',
                      title: t('global.notificationError'),
                      message: t('chat.validations.messageChangeFailed'),
                    });
                  }
                }}
              />
            }
            size="medium"
          />
        )}
        {isEditing && (
          <Icon
            style={{ cursor: 'pointer' }}
            icon={
              <AiOutlineClose
                fontSize={22}
                color="#D73E3E"
                onClick={() => {
                  setIsEditing(false);
                  setContent(content);
                }}
              />
            }
            size="medium"
          />
        )}
      </Track>
    );
  };

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
        header: 'Id',
        cell: idView,
      }),
      columnHelper.accessor('chatId', {
        id: 'chatId',
        header: 'Chat Id',
        cell: idView,
      }),
      columnHelper.accessor('content', {
        header: 'Message',
        cell: contentView,
      }),
      columnHelper.accessor('created', {
        header: 'Requested At',
        cell: (props) => (
          <span>
            {format(new Date(props.getValue() ?? ''), 'dd-MM-yyyy HH:mm:ss')}
          </span>
        ),
      }),
      columnHelper.display({
        header: 'Approve',
        cell: (props) => (
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
        ),
        id: 'approve',
      }),
    ],
    []
  );

  return (
    <>
      <h1>{t('chat.validations.title')}</h1>
      <p>{t('chat.validations.description')}</p>
      <Card>
        <DataTable
          data={validationRequests?.response ?? []}
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
    </>
  );
};

export default withAuthorization(ValidationRequests, [
  ROLES.ROLE_ADMINISTRATOR,
  ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
]);
