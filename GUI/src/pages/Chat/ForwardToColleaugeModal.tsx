import { FC, useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { MdOutlineArrowForward } from 'react-icons/md';
import { apiDev } from 'services/api';

import {
  Button,
  DataTable,
  Dialog,
  FormCheckbox,
  FormInput,
  Icon,
  Tooltip,
  Track,
} from 'components';
import { User } from 'types/user';
import { Chat } from 'types/chat';
import { useDebouncedCallback } from 'use-debounce';
import useStore from 'store';
import { format } from 'date-fns';
import { DialogTrigger } from '@radix-ui/react-dialog';

type ForwardToColleaugeModalProps = {
    chat: Chat;
    onModalClose: () => void;
    onForward: (chat: Chat, user: User) => void;
};

const ForwardToColleaugeModal: FC<ForwardToColleaugeModalProps> = ({
  chat,
  onModalClose,
  onForward,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [showActiveAgents, setShowActiveAgents] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [usersList, setUsersList] = useState<User[] | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const userInfo = useStore((state) => state.userInfo);
  const getUsers = (
    pagination: PaginationState,
    filter: string,
    sorting: SortingState,
    showActiveOnly: boolean = false
  ) => {
    const sort =
      sorting.length === 0
        ? 'name asc'
        : sorting[0].id + ' ' + (sorting[0].desc ? 'desc' : 'asc');
    apiDev
      .post(`accounts/customer-support-agents`, {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search_full_name_and_csa_title: filter,
        sorting: sort,
        show_active_only: showActiveOnly,
        current_user_id: userInfo?.idCode ?? '',
      })
      .then((res: any) => {
        setUsersList(res?.data?.response ?? []);
        setTotalPages(res?.data?.response[0]?.totalPages ?? 1);
      })
      .catch((error: any) => console.log(error));
  };

  const debouncedGetUsers = useDebouncedCallback(getUsers, 300);

  useEffect(() => {
    getUsers(pagination, filter, sorting, showActiveAgents);
  }, [showActiveAgents]);

    const columnHelper = createColumnHelper<User>();

    const customerSupportStatusView = (props: any) => {
        const isIdle = props.getValue() === 'idle' ? '#FFB511' : '#D73E3E';
        return (
            <span
                style={{
                    display: 'block',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: props.getValue() === 'online' ? '#308653' : isIdle,
                }}
            ></span>
        );
    };

    const forwardView = (props: any) => {
      const status = props.row.original.customerSupportStatus;
      return status === 'online' || status === 'idle' ? (
        <Button
          appearance="text"
          onClick={() => {
            onForward(chat, props.row.original);
          }}
        >
          <Icon icon={<MdOutlineArrowForward color="rgba(0, 0, 0, 0.54)" />} />
          {t('global.forward')}
        </Button>
      ) : null;
    };

    const statusCommentView = (props: any) => {
    const value = props.getValue();
    const statusTimeStamp = format(new Date(props.row.original.statusCommentTimeStamp), 'HH:mm:ss');
    const statusDateTimeStamp = format(new Date(props.row.original.statusCommentTimeStamp), 'dd.MM HH:mm');
    const statusComment = value.length < 13 ? `${value}` : `${value?.slice?.(0, 13)}...`;
    return (
      <Tooltip content={value.length > 13 ? `${statusDateTimeStamp} ${value}` : ''}>
       <DialogTrigger asChild>
        <span style={{ maxWidth: '170px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {value ? statusComment : ''}
          {value ? (
            <time
              dateTime={statusTimeStamp}
              className="active-chat__message-date"
            >
              {statusTimeStamp}
            </time>
          ) : (
            ''
          )}
        </span>
       </DialogTrigger>
      </Tooltip>
    );
  };

    const usersColumns = useMemo(
      () => [
        columnHelper.accessor(
          (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`,
          {
            id: `name`,
            header: t('settings.users.name') ?? '',
          }
        ),
        columnHelper.accessor('csaTitle', {
          header: t('settings.users.userTitle') ?? '',
        }),
        columnHelper.accessor('customerSupportStatus', {
          header: t('global.status') ?? '',
          cell: customerSupportStatusView,
        }),
        columnHelper.accessor('statusComment', {
          header: t('global.statusClarification') ?? '',
          cell: statusCommentView,
        }),
        columnHelper.display({
          id: 'forward',
          cell: forwardView,
          meta: {
            size: '1%',
          },
        }),
      ],
      []
    );

  return (
    <Dialog
      title={t('chat.active.forwardChat')}
      onClose={onModalClose}
      size="large"
    >
      <Track
        direction="vertical"
        gap={8}
        style={{
          margin: '-16px -16px 0',
          padding: '16px',
          borderBottom: '1px solid #D2D3D8',
        }}
      >
        <FormInput
          label={t('chat.active.searchByName')}
          name="search"
          placeholder={t('chat.active.searchByName') + '...'}
          hideLabel
          onChange={(e) => {
            const filter = e.target.value;

            setFilter(filter);
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
            debouncedGetUsers(pagination, filter, sorting, showActiveAgents);
          }}
        />
        <FormCheckbox
          label={t('chat.active.onlyActiveAgents')}
          hideLabel
          name="active"
          item={{
            label: t('chat.active.onlyActiveAgents'),
            value: 'active',
          }}
          onChange={(e) => setShowActiveAgents(e.target.checked)}
        />
      </Track>
      {usersList && (
        <DataTable
          data={usersList}
          columns={usersColumns}
          sortable
          pagination={pagination}
          setPagination={(state: PaginationState) => {
            if (
              state.pageIndex === pagination.pageIndex &&
              state.pageSize === pagination.pageSize
            )
              return;
            setPagination(state);
            getUsers(state, filter, sorting, showActiveAgents);
          }}
          sorting={sorting}
          setSorting={(state: SortingState) => {
            setSorting(state);
            getUsers(pagination, filter, state, showActiveAgents);
          }}
          pagesCount={totalPages}
          isClientSide={false}
        />
      )}
    </Dialog>
  );
};

export default ForwardToColleaugeModal;
