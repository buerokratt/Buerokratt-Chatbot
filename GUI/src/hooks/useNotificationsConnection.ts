import { userStore as useHeaderStore } from '@buerokratt-ria/header';
import { useNotificationEvent, useNotificationsClient } from '@buerokratt-ria/notifications/react';
import { isValidationsEnabled } from 'constants/config';
import { useEffect } from 'react';

const useNotificationsConnection = (enabled: boolean) => {
  const selectedChatId = useHeaderStore((state) => state.selectedChatId);
  const { connect, disconnect } = useNotificationsClient();

  useNotificationEvent('chat_status_changed', async () => {
    const store = useHeaderStore.getState();
    const reloads = [store.loadActiveChats(), store.loadPendingChats()];

    if (isValidationsEnabled) reloads.push(store.loadValidationChats());

    const results = await Promise.allSettled(reloads);
    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.error('Failed to refresh chats after chat_status_changed', result.reason);
      }
    });
  });

  useEffect(() => {
    if (!enabled) return;

    selectedChatId ? connect({ chatUuids: selectedChatId }) : connect();
    return disconnect;
  }, [selectedChatId, connect, disconnect, enabled]);
};

export default useNotificationsConnection;
