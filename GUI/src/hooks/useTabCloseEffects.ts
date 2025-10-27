import { useEffect } from 'react';
import { CHAT_SESSIONS } from '../constants/config';
import { generateUEID } from '../utils/generateUEID';
import { notificationApiDev } from '../services/api';

declare global {
  interface Window {
    __chatSessionInitialized__?: boolean;
  }
}

const useTabCloseEffect = () => {
  const baseUrl = import.meta.env.REACT_APP_NOTIFICATION_NODE_URL;
  const logoutPath = '/add-to-logout-queue';
  const cancelLogoutPath = '/remove-from-logout-queue'

  const isLastSession = (): boolean => {
    const currentState = JSON.parse(
      localStorage.getItem(CHAT_SESSIONS.SESSION_STATE_KEY) as string
    ) || { ids: [], count: 0 };
    return currentState.count <= 1;
  };

  const getCurrentSessionState = () => {
    return (
      JSON.parse(
        localStorage.getItem(CHAT_SESSIONS.SESSION_STATE_KEY) as string
      ) || { ids: [], count: 0 }
    );
  };

  const makeCall = (decision: "add" | "cancel") => {
    try {
      const supportsBeacon = !!navigator.sendBeacon;

      const currenntPath = decision === "add" ? logoutPath : cancelLogoutPath;

      if (supportsBeacon) {
        const blob = new Blob([], {
          type: 'application/x-www-form-urlencoded',
        });
        navigator.sendBeacon(baseUrl + currenntPath, blob);
      } else {
        return notificationApiDev.post(currenntPath);
      }
    } catch (err) {
      console.warn('Beacon failed, falling back to logout mutation', err);
      return notificationApiDev.post(decision === "add" ? logoutPath : cancelLogoutPath);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      return makeCall("cancel");
    }, 2500);
  }, []);

  useEffect(() => {
    if (window.__chatSessionInitialized__) return;
    window.__chatSessionInitialized__ = true;

    const tabId =
      sessionStorage.getItem(CHAT_SESSIONS.SESSION_ID_KEY) || generateUEID();
    sessionStorage.setItem(CHAT_SESSIONS.SESSION_ID_KEY, tabId);

    const currentState = getCurrentSessionState();
    if (!currentState.ids.includes(tabId)) {
      currentState.ids.push(tabId);
      currentState.count = currentState.ids.length;
      localStorage.setItem(
        CHAT_SESSIONS.SESSION_STATE_KEY,
        JSON.stringify(currentState)
      );
    }

    const handleTabClose = () => {
      const currentAppState = JSON.parse(
        localStorage.getItem(CHAT_SESSIONS.SESSION_STATE_KEY) ||
          '{"ids":[],"count":0}'
      );

      const updatedIds = currentAppState.ids.filter(
        (id: string) => id !== tabId
      );
      localStorage.setItem(
        CHAT_SESSIONS.SESSION_STATE_KEY,
        JSON.stringify({ ids: updatedIds, count: updatedIds.length })
      );

      const lastInitial = currentAppState.count <= 1;

      if (lastInitial && isLastSession()) {
        return makeCall("add");
      }
    };

    window.addEventListener('beforeunload', handleTabClose);
  }, []);
};

export default useTabCloseEffect;
