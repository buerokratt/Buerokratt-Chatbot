import { userStore as useHeaderStore } from '@buerokratt-ria/header';
import { useNotificationsClient } from '@buerokratt-ria/notifications/react';
import { useEffect } from 'react';

const useNotificationsConnection = (enabled: boolean) => {
  const selectedChatId = useHeaderStore((state) => state.selectedChatId);
  const { connect, disconnect } = useNotificationsClient();

  useEffect(() => {
    if (!enabled) return;

    selectedChatId ? connect({ chatUuids: selectedChatId }) : connect();
    return disconnect;
  }, [selectedChatId, connect, disconnect, enabled]);
};

export default useNotificationsConnection;
