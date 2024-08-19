import { useEffect, useState } from 'react';
import { userStore as useHeaderStore } from '@buerokratt-ria/header';

export const useMenuCountConf = () => {
  const unansweredChatsLength = useHeaderStore((state) => state.unansweredChatsLength());
  const { myChats, otherChats } = useHeaderStore((state) => state.getGroupedActiveChats());
  const pendingChatsLength = useHeaderStore((state) => state.pendingChats.length);

  const [menuCountConf, setMenuCountConf] = useState({});

  useEffect(() => {
    setMenuCountConf({
      '/unanswered': unansweredChatsLength,
      '/active': otherChats.length + myChats.length,
      '/pending': pendingChatsLength,
    });
  }, [unansweredChatsLength, otherChats.length, myChats.length, pendingChatsLength]);

  return menuCountConf;
};
