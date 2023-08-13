import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { MdOutlineEdit, MdOutlineDeleteOutline } from 'react-icons/md';

import { Button, Card, DataTable, Dialog, Icon, Track } from 'components';
import { User } from 'types/user';
import { deleteUser } from 'services/users';
import { useToast } from 'hooks/useToast';
import UserModal from './UserModal';
import { ROLES } from 'utils/constants';

const SettingsUsers: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [newUserModal, setNewUserModal] = useState(false);
  const [editableRow, setEditableRow] = useState<User | null>(null);
  const [deletableRow, setDeletableRow] = useState<string | number | null>(
    null
  );
  const [usersList, setUsersList] = useState<User[]>([]);
  const { data: users } = useQuery<User[]>({
    queryKey: ['cs-get-customer-support-agents', 'prod'],
    onSuccess(res: any) {
      setUsersList(res.data.get_customer_support_agents);
    },
  });
  const columnHelper = createColumnHelper<User>();

  const deleteUserMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) => deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        'cs-get-customer-support-agents',
        'prod',
      ]);
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

  const usersColumns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`,
        {
          id: `name`,
          header: t('settings.users.name') || '',
        }
      ),
      columnHelper.accessor('idCode', {
        header: t('settings.users.idCode') || '',
      }),
      columnHelper.accessor(
        (data: { authorities: ROLES[] }) => {
          const output: string[] = [];
          data.authorities.map((role) => {
            return output.push(t(`roles.${role}`));
          });
          return output;
        },
        {
          header: t('settings.users.role') || '',
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
        header: t('settings.users.displayName') || '',
      }),
      columnHelper.accessor('csaTitle', {
        header: t('settings.users.userTitle') || '',
      }),
      columnHelper.accessor('csaEmail', {
        header: t('settings.users.email') || '',
      }),
      columnHelper.display({
        id: 'edit',
        cell: (props) => (
          <Button
            appearance="text"
            onClick={() => setEditableRow(props.row.original)}
          >
            <Icon icon={<MdOutlineEdit />} />
            {t('global.edit')}
          </Button>
        ),
        meta: {
          size: '1%',
        },
      }),
      columnHelper.display({
        id: 'delete',
        cell: (props) => (
          <Button
            appearance="text"
            onClick={() => setDeletableRow(props.row.original.idCode)}
          >
            <Icon icon={<MdOutlineDeleteOutline />} />
            {t('global.delete')}
          </Button>
        ),
        meta: {
          size: '1%',
        },
      }),
    ],
    []
  );

  if (!users) return <>Loading...</>;

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
        />
      </Card>

      {newUserModal && <UserModal onClose={() => setNewUserModal(false)} />}

      {editableRow && (
        <UserModal user={editableRow} onClose={() => setEditableRow(null)} />
      )}

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

export default SettingsUsers;
