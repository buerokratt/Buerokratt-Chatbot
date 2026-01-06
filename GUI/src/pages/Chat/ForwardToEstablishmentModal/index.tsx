import { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable, Dialog, FormInput, Track } from 'components';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chat } from 'types/chat';
import { useDebouncedCallback } from 'use-debounce';

import { createEstablishmentColumns } from './establishment-columns';
import { useEstablishments } from './use-establishments';

type ForwardToEstablishmentModalProps = {
  chat: Chat;
  onModalClose: () => void;
  onForward: (chat: Chat, establishment: string) => void;
};

const ForwardToEstablishmentModal: FC<ForwardToEstablishmentModalProps> = ({ chat, onModalClose, onForward }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const debouncedSetFilter = useDebouncedCallback((value: string) => {
    setDebouncedFilter(value);
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  }, 300);

  const { establishmentsList, totalPages, errorMessage, isLoading } = useEstablishments(
    pagination,
    debouncedFilter,
    sorting,
  );

  const establishmentsColumns = useMemo(() => createEstablishmentColumns(chat, onForward, t), [chat, onForward, t]);

  const renderTableContent = () => {
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

    if (establishmentsList.length > 0) {
      return (
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
      );
    }

    return null;
  };

  return (
    <Dialog title={t('chat.active.forwardChat')} onClose={onModalClose} size="large">
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
          value={filter}
          onChange={(e) => {
            const value = e.target.value;
            setFilter(value);
            debouncedSetFilter(value);
          }}
        />
      </Track>
      {renderTableContent()}
    </Dialog>
  );
};

export default ForwardToEstablishmentModal;
