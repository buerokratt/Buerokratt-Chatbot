import { useNotificationsClient } from '@buerokratt-ria/notifications/react';
import { useEffect } from 'react';

const useWebPush = () => {
  const { enableWebPush, reconnect } = useNotificationsClient();

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    let isActive = true;

    void enableWebPush()
      .then((result) => {
        if (isActive && result.status === 'enabled') reconnect();
      })
      .catch((error: unknown) => {
        if (isActive) console.error('Failed to enable Web Push', error);
      });

    return () => {
      isActive = false;
    };
  }, [enableWebPush, reconnect]);
};

export default useWebPush;
