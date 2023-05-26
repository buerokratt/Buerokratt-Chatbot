import { FC, useEffect, useMemo, useState } from 'react';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Button, DataTable, Dialog, FormInput, Icon, Track } from 'components';
import { Chat } from 'types/chat';
import { MdOutlineArrowForward } from 'react-icons/md';
import { Service } from 'types/service';
import api from 'services/api';
import { useToast } from 'hooks/useToast';

type StartAServiceModalProps = {
  chat: Chat;
  onModalClose: () => void;
}

const StartAServiceModal: FC<StartAServiceModalProps> = ({ chat, onModalClose }) => {
  const { t } = useTranslation();
  const [searchName, setSearchName] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [services, setServices] = useState<Service[]>([]);
  const toast = useToast();

  useEffect(() => {
    api.get('active-services')
      .then((res) => setServices(res.data))
  }, []);

  const onStartService = ({ state, name }: Service) => {
    const url = `/services/${state}/${name}`;
    api.post(url, chat)
      .then(() => {
        onModalClose()
        toast.open({
          type: 'success',
          title: t('global.notification'),
          message: `Service '${name}' has started`,
        });
      }).catch((error: any) => {
        toast.open({
          type: 'error',
          title: t('global.notificationError'),
          message: error.message,
        });
      })
  }

  const columnHelper = createColumnHelper<Service>();

  const usersColumns = useMemo(() => [
    columnHelper.accessor('name', {
      header: t('chat.active.service') || '',
    }),
    columnHelper.display({
      id: 'start',
      cell: (props) => (
        <Button appearance='text' onClick={() => onStartService(props.row.original)}>
          <Icon icon={<MdOutlineArrowForward color='rgba(0, 0, 0, 0.54)' />} />
          {t('chat.active.start')}
        </Button>
      ),
      meta: {
        size: '1%',
      },
    }),
  ], []);

  return (
    <Dialog
      title={t('chat.active.startService')}
      onClose={onModalClose}
    >
      <Track
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
          onChange={(e) => setSearchName(e.target.value)}
          value={searchName}
        />
      </Track>
      <DataTable
        data={services}
        columns={usersColumns}
        globalFilter={searchName}
        setGlobalFilter={setSearchName}
        sortable
        pagination={pagination}
        setPagination={setPagination}
      />
    </Dialog>
  )
}

export default StartAServiceModal;
