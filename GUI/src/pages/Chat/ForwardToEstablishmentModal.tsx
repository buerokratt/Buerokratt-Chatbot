import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, PaginationState, SortingState } from '@tanstack/react-table';
import { Button, DataTable, Dialog, FormInput, Icon, Track } from 'components';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
  const {
    data: establishments,
    isError,
    isLoading,
  } = useQuery({
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
  });

  useEffect(() => {
    if (establishments) {
      setEstablishmentsList(establishments.response.items);
      setTotalPages(establishments.response.totalPages);
      setErrorMessage(null);
    }
  }, [establishments]);

  useEffect(() => {
    if (isError) {
      setErrorMessage(t('chat.active.establishmentListError'));
    }
  }, [isError, t]);

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

  const renderContent = () => {
    if (errorMessage) {
      return (
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
      );
    }

    if (isLoading) {
      return (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          {t('global.loading')}
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <Dialog title={t('chat.active.forwardChat')} onClose={onModalClose} size="large">
      {renderContent()}
    </Dialog>
  );
};

export default ForwardToEstablishmentModal;
