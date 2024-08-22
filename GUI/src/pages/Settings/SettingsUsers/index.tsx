import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import {
  PaginationState,
  Row,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { MdOutlineEdit, MdOutlineDeleteOutline } from 'react-icons/md';
import { apiDev } from 'services/api';
import { Button, Card, DataTable, Dialog, Icon, Track } from 'components';
import { User } from 'types/user';
import { deleteUser } from 'services/users';
import { useToast } from 'hooks/useToast';
import UserModal from './UserModal';
import { ROLES } from 'utils/constants';
import withAuthorization from 'hoc/with-authorization';

const SettingsUsers: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [newUserModal, setNewUserModal] = useState(false);
  const [editableRow, setEditableRow] = useState<User | null>(null);
  const [deletableRow, setDeletableRow] = useState<string | number | null>(
    null
  );
  const [usersList, setUsersList] = useState<User[] | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  const getUsers = (pagination: PaginationState, sorting: SortingState) => {
    const sort =
      sorting.length === 0
        ? 'name asc'
        : sorting[0].id + ' ' + (sorting[0].desc ? 'desc' : 'asc');
    apiDev
      .post(`accounts/customer-support-agents`, {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        sorting: sort,
      })
      .then((res: any) => {
        setUsersList(res?.data?.response ?? []);
        setTotalPages(res?.data?.response[0]?.totalPages ?? 1);
      })
      .catch((error: any) => console.log(error));
  };

  useEffect(() => {
    getUsers(pagination, sorting);
  }, []);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnHelper = createColumnHelper<User>();

  const deleteUserMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) => deleteUser(id),
    onSuccess: async () => {
      getUsers(pagination, sorting);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.userDeleted'),
      });
      setDeletableRow(null);
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const editView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => setEditableRow(props.row.original)}
    >
      <Icon icon={<MdOutlineEdit />} />
      {t('global.edit')}
    </Button>
  );

  const deleteView = (props: any) => (
    <Button
      appearance="text"
      onClick={() => setDeletableRow(props.row.original.idCode)}
    >
      <Icon icon={<MdOutlineDeleteOutline />} />
      {t('global.delete')}
    </Button>
  );

  const usersColumns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`,
        {
          id: `name`,
          header: t('settings.users.name') ?? '',
        }
      ),
      columnHelper.accessor('idCode', {
        header: t('settings.users.idCode') ?? '',
      }),
      columnHelper.accessor(
        (data: { authorities: ROLES[] }) => {
          const output: string[] = [];
          data.authorities?.map?.((role) => {
            return output.push(t(`roles.${role}`));
          });
          return output;
        },
        {
          header: t('settings.users.role') ?? '',
          cell: (props) => props.getValue().join(', '),
          filterFn: (row: Row<User>, _, filterValue) => {
            const rowAuthorities: string[] = [];
            row.original.authorities.map((role) => {
              return rowAuthorities.push(t(`roles.${role}`));
            });
            const filteredArray = rowAuthorities.filter((word) =>
              word.toLowerCase().includes(filterValue.toLowerCase())
            );
            return filteredArray.length > 0;
          },
        }
      ),
      columnHelper.accessor('displayName', {
        header: t('settings.users.displayName') ?? '',
      }),
      columnHelper.accessor('csaTitle', {
        header: t('settings.users.userTitle') ?? '',
      }),
      columnHelper.accessor('csaEmail', {
        header: t('settings.users.email') ?? '',
      }),
      columnHelper.display({
        id: 'edit',
        cell: editView,
        meta: {
          size: '1%',
        },
      }),
      columnHelper.display({
        id: 'delete',
        cell: deleteView,
        meta: {
          size: '1%',
        },
      }),
    ],
    []
  );

  if (!usersList) return <>Loading...</>;

  return (
    <>
      <Track gap={16} justify="between" style={{ paddingBottom: '10px' }}>
        <h1>{t('settings.users.title')}</h1>
        <Button onClick={() => setNewUserModal(true)}>
          {t('settings.users.addUser')}
        </Button>
      </Track>

      <Card>
        <DataTable
          data={usersList}
          columns={usersColumns}
          sortable
          filterable
          pagination={pagination}
          setPagination={(state: PaginationState) => {
            if (
              state.pageIndex === pagination.pageIndex &&
              state.pageSize === pagination.pageSize
            )
              return;
            setPagination(state);
            getUsers(state, sorting);
          }}
          sorting={sorting}
          setSorting={(state: SortingState) => {
            setSorting(state);
            getUsers(pagination, state);
          }}
          pagesCount={totalPages}
          isClientSide={false}
        />
      </Card>

      {
        newUserModal && <UserModal onClose={() => {
          setNewUserModal(false);
          getUsers(pagination, sorting);
        }} />
      }

      {
        editableRow && <UserModal user={editableRow} onClose={() => {
          setEditableRow(null);
          getUsers(pagination, sorting);
        }} />
      }

      {deletableRow !== null && (
        <Dialog
          title={t('settings.users.deleteUser')}
          onClose={() => setDeletableRow(null)}
          footer={
            <>
              <Button
                appearance="secondary"
                onClick={() => setDeletableRow(null)}
              >
                {t('global.no')}
              </Button>
              <Button
                appearance="error"
                onClick={() => deleteUserMutation.mutate({ id: deletableRow })}
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

export default withAuthorization(SettingsUsers, [ROLES.ROLE_ADMINISTRATOR]);
