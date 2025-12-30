import { useQuery } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import { Establishment, EstablishmentsResponse } from 'types/establishment';

export const useEstablishments = (pagination: PaginationState) => {
  const { t } = useTranslation();
  const [establishmentsList, setEstablishmentsList] = useState<Establishment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return {
    establishmentsList,
    totalPages,
    errorMessage,
    isLoading,
  };
};
