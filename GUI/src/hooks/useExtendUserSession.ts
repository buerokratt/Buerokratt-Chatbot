import { useNotificationsClient } from '@buerokratt-ria/notifications/react';
import { useMutation } from '@tanstack/react-query';
import type { CustomJwtExtendResponse } from 'model/ruuter-response-model';
import { useCookies } from 'react-cookie';
import { apiDev } from 'services/api';

const CUSTOM_JWT_COOKIE = 'customJwtCookie';

const useExtendUserSession = () => {
  const [, setCookie] = useCookies([CUSTOM_JWT_COOKIE]);
  const { reconnect } = useNotificationsClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiDev.post<CustomJwtExtendResponse>('extend', {});
      const token = response.data.data.custom_jwt_extend;

      if (token === null) return;

      setCookie(CUSTOM_JWT_COOKIE, token, { path: '/' });
      reconnect();
    },
  });
};

export default useExtendUserSession;
