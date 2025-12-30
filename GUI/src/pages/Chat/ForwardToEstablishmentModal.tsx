import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, PaginationState, SortingState } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { Button, DataTable, Dialog, FormInput, Icon, Track } from 'components';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineArrowForward } from 'react-icons/md';
import { apiDev } from 'services/api';
import { Chat } from 'types/chat';
import { Establishment, EstablishmentsResponse } from 'types/establishment';

type ForwardToEstablishmentModalProps = {
  chat: Chat;
  onModalClose: () => void;
  onForward: (chat: Chat, establishment: string) => void;
};

// todo 1663 igor fe modal
// todo 1663 tests
// todo 1663 linter
const ForwardToEstablishmentModal: FC<ForwardToEstablishmentModalProps> = ({ chat, onModalClose, onForward }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [establishmentsList, setEstablishmentsList] = useState<Establishment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // todo 1663 this needs an MSW mock
  const { data: establishments } = useQuery<EstablishmentsResponse>({
    queryKey: ['configs/centops-establishments', pagination.pageIndex + 1, pagination.pageSize],
    queryFn: async () => {
      const { data } = await apiDev.get<EstablishmentsResponse>('/configs/centops-establishments', {
        params: {
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
        },
      });
      return data;
    },
    onSuccess(res: EstablishmentsResponse) {
      setEstablishmentsList(res.response.items);
      setTotalPages(res.response.totalPages);
      setErrorMessage(null);
    },
    onError: (_error: AxiosError<{ response?: string }>) => {
      setErrorMessage(t('chat.active.establishmentListError'));
    },
  });

  const columnHelper = createColumnHelper<Establishment>();

  const forwardView = useCallback(
    (props: { row: { original: Establishment } }) => (
      <Button appearance="text" onClick={() => onForward(chat, props.row.original.name)}>
        <Icon icon={<MdOutlineArrowForward color="rgba(0, 0, 0, 0.54)" />} />
        {t('global.forward')}
      </Button>
    ),
    [chat, onForward, t],
  );

  const establishmentsColumns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('chat.active.establishment') ?? '',
        cell: (props) => props.getValue(),
      }),
      columnHelper.display({
        id: 'forward',
        cell: forwardView,
        meta: {
          size: '1%',
        },
      }),
    ],
    [columnHelper, forwardView, t],
  );

  return (
    <Dialog title={t('chat.active.forwardChat')} onClose={onModalClose} size="large">
      {errorMessage ? (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            color: '#D73E3E',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          {errorMessage}
        </div>
      ) : (
        <>
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
              label={t('chat.active.searchByEstablishmentName')}
              name="search"
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
              sorting={sorting}
              setSorting={setSorting}
              pagesCount={totalPages}
              isClientSide={false}
            />
          )}
        </>
      )}
    </Dialog>
  );
};

export default ForwardToEstablishmentModal;
