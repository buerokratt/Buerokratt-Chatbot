import { useEffect, useState } from 'react';

import sse from 'services/sse';
import { Chat } from 'types/chat';

const useGetActiveChats = () => {
  const [activeChats, setActiveChats] = useState<Chat[]>([]);

  useEffect(() => {
    const sseInstance = sse('cs-get-all-active-chats');

    sseInstance.onMessage<Chat[]>((data) => {
      if (data) {
        setActiveChats(data);
      }
    });

    return () => {
      sseInstance.close();
    };
  }, []);

  return { activeChats };
};

export default useGetActiveChats;
