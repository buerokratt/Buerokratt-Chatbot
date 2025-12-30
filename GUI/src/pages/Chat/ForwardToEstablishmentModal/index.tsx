import { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable, Dialog, FormInput, Track } from 'components';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chat } from 'types/chat';

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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { establishmentsList, totalPages, errorMessage, isLoading } = useEstablishments(pagination, filter, sorting);

  const establishmentsColumns = useMemo(() => createEstablishmentColumns(chat, onForward, t), [chat, onForward, t]);

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
        {establishmentsList.length > 0 && (
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
