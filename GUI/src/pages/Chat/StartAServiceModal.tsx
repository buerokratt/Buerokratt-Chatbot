import { FC, useEffect, useMemo, useState } from 'react';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Button, DataTable, Dialog, FormInput, Icon, Track } from 'components';
import { Chat } from 'types/chat';
import { MdOutlineArrowForward } from 'react-icons/md';
import { Service } from 'types/service';
import api from 'services/api';

type StartAServiceModalProps = {
  chat: Chat;
  onModalClose: () => void;
  onStartService: (chat: Chat, service: Service) => void;
}

const StartAServiceModal: FC<StartAServiceModalProps> = ({ chat, onModalClose, onStartService }) => {
  const { t } = useTranslation();
  const [searchName, setSearchName] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    api.get('services')
      .then((res) => setServices(res.data))
  }, []);

  const columnHelper = createColumnHelper<Service>();

  const usersColumns = useMemo(() => [
    columnHelper.accessor('name', {
      header: t('chat.active.service') || '',
    }),
    columnHelper.display({
      id: 'start',
      cell: (props) => (
        <Button appearance='text' onClick={() => { onStartService(chat, props.row.original) }}>
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
