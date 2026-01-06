import { isHiddenFeaturesEnabled } from 'constants/config';

import { useQuery } from '@tanstack/react-query';
import { Button } from 'components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';

interface ForwardToEstablishmentButtonProps {
  disabled: boolean;
  onClick: (() => void) | undefined;
}

interface CentOpsStatusResponse {
  response: {
    configured: boolean;
  };
}

export const ForwardToEstablishmentButton: FC<ForwardToEstablishmentButtonProps> = ({ disabled, onClick }) => {
  const { t } = useTranslation();

  const { data: centOpsStatus } = useQuery<CentOpsStatusResponse>({
    queryKey: ['configs/centops-status'],
    queryFn: async () => {
      const response = await apiDev.get<CentOpsStatusResponse>('/configs/centops-status');
      return response.data;
    },
    enabled: isHiddenFeaturesEnabled,
  });

  const shouldShowButton = isHiddenFeaturesEnabled && centOpsStatus?.response.configured === true;

  if (!shouldShowButton) return null;

  return (
    <Button appearance="secondary" disabled={disabled} onClick={onClick}>
      {t('chat.active.forwardToOrganization')}
    </Button>
  );
};
