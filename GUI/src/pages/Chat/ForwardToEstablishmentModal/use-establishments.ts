import { useQuery } from '@tanstack/react-query';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import { Establishment, EstablishmentsResponse } from 'types/establishment';

export const useEstablishments = (pagination: PaginationState, filter: string, sorting: SortingState) => {
  const { t } = useTranslation();
  const [establishmentsList, setEstablishmentsList] = useState<Establishment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getSortOrder = () => {
    if (sorting.length === 0) {
      return 'asc';
    }
    if (sorting[0].desc) {
      return 'desc';
    }
    return 'asc';
  };

  const sortOrder = getSortOrder();

  const {
    data: establishments,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['configs/centops-establishments', pagination.pageIndex + 1, pagination.pageSize, filter, sorting],
    queryFn: async () => {
      const { data } = await apiDev.get<EstablishmentsResponse>('/configs/centops-establishments', {
        params: {
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          sortOrder,
          filter,
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

  return {
    establishmentsList,
    totalPages,
    errorMessage,
    isLoading,
  };
};
