import { FC, useMemo, useState } from 'react';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdOutlineArrowForward } from 'react-icons/md';

import { Button, DataTable, Dialog, FormInput, Icon, Track } from 'components';
import { Chat } from 'types/chat';
import { Establishment } from 'types/establishment';

type ForwardToEstablishmentModalProps = {
  chat: Chat;
  onModalClose: () => void;
  onForward: (chat: Chat, establishment: string) => void;
}

const ForwardToEstablishmentModal: FC<ForwardToEstablishmentModalProps> = ({ chat, onModalClose, onForward }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [establishmentsList, setEstablishmentsList] = useState<Establishment[]>([]);
  const { data: establishments } = useQuery<Establishment[]>({
    queryKey: ['cs-get-all-establishments', 'prod'],
    onSuccess(res: any) {
      setEstablishmentsList((res.data.format_data.establishments as string[]).map((name: string, id): Establishment => {
        return { id, name };
      }));
    }
  });

  const columnHelper = createColumnHelper<Establishment>();

  const establishmentsColumns = useMemo(() => [
    columnHelper.accessor('name', {
      header: t('chat.active.establishment') || '',
      cell: (props) => props.getValue(),
    }),
    columnHelper.display({
      id: 'forward',
      cell: (props) => (
        <Button appearance='text' onClick={() => onForward(chat, props.row.original.name)}>
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
          label={t('chat.active.searchByEstablishmentName')}
          name='search'
          placeholder={t('chat.active.searchByEstablishmentName') + '...'}
          hideLabel
          onChange={(e) => setFilter(e.target.value)}
        />
      </Track>
      {establishments && (
        <DataTable
          data={establishmentsList}
          columns={establishmentsColumns}
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

export default ForwardToEstablishmentModal;
