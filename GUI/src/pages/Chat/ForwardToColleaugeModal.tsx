import { FC, useMemo, useState } from 'react';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdOutlineArrowForward } from 'react-icons/md';

import { Button, DataTable, Dialog, FormCheckbox, FormInput, Icon, Track } from 'components';
import { User } from 'types/user';
import { Chat } from 'types/chat';

type ForwardToColleaugeModalProps = {
  chat: Chat;
  onModalClose: () => void;
  onForward: (chat: Chat, user: User) => void;
}

const ForwardToColleaugeModal: FC<ForwardToColleaugeModalProps> = ({ chat, onModalClose, onForward }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [showActiveAgents, setShowActiveAgents] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [usersList, setUsersList] = useState<User[]>([]);
  const { data: users } = useQuery<User[]>({
    queryKey: ['/cs-get-customer-support-agents', 'prod'],
    onSuccess(res: any) {
      setUsersList(res.data.get_customer_support_agents);
    },
  });

  const filteredUsers = useMemo(() => usersList && showActiveAgents ? usersList?.filter((u) => u.customerSupportStatus === 'online') : usersList, [usersList, showActiveAgents]);

  const columnHelper = createColumnHelper<User>();

  const usersColumns = useMemo(() => [
    columnHelper.accessor('displayName', {
      header: t('settings.users.name') || '',
    }),
    columnHelper.accessor('csaTitle', {
      header: t('settings.users.displayName') || '',
    }),
    columnHelper.accessor('customerSupportStatus', {
      header: t('global.status') || '',
      cell: (props) => (
        <span style={{
          display: 'block',
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: props.getValue() === 'online'
            ? '#308653'
            : props.getValue() === 'idle' ? '#FFB511' : '#D73E3E',
        }}></span>
      ),
    }),
    columnHelper.display({
      id: 'forward',
      cell: (props) => (
        <Button appearance='text' onClick={() => onForward(chat, props.row.original)}>
          <Icon icon={<MdOutlineArrowForward color='rgba(0, 0, 0, 0.54)' />} />
          {t('global.forward')}
        </Button>
      ),
      meta: {
        size: '1%',
      },
    }),
  ], []);

  return (
    <Dialog title={t('chat.active.forwardChat')} onClose={onModalClose} size='large'>
      <Track
        direction='vertical'
        gap={8}
        style={{
          margin: '-16px -16px 0',
          padding: '16px',
          borderBottom: '1px solid #D2D3D8',
        }}>
        <FormInput
          label={t('chat.active.searchByName')}
          name='search'
          placeholder={t('chat.active.searchByName') + '...'}
          hideLabel
          onChange={(e) => setFilter(e.target.value)}
        />
        <FormCheckbox
          label={t('chat.active.onlyActiveAgents')}
          hideLabel name='active'
          item={{
            label: t('chat.active.onlyActiveAgents'),
            value: 'active',
          }}
          onChange={(e) => setShowActiveAgents(e.target.checked)}
        />
      </Track>
      {users && (
        <DataTable
          data={filteredUsers}
          columns={usersColumns}
          globalFilter={filter}
          setGlobalFilter={setFilter}
          sortable
          pagination={pagination}
          setPagination={setPagination}
        />
      )}
    </Dialog>
  );
};

export default ForwardToColleaugeModal;
