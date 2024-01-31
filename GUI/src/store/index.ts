import { create } from 'zustand';
import { UserInfo } from 'types/userInfo';
import { CHAT_STATUS, Chat as ChatType } from 'types/chat';

interface StoreState {
  userInfo: UserInfo | null;
  userId: string;
  activeChats: ChatType[];
  selectedChatId: string | null;
  chatCsaActive: boolean;
  setActiveChats: (chats: ChatType[]) => void;
  setUserInfo: (info: UserInfo) => void;
  setSelectedChatId: (id: string | null) => void;
  setChatCsaActive: (active: boolean) => void;
  selectedChat: () => ChatType | null | undefined;
  unansweredChats: () => ChatType[];
  forwordedChats: () => ChatType[];
  unansweredChatsLength: () => number;
  forwordedChatsLength: () => number;
}

const useStore = create<StoreState>((set, get, store) => ({
  userInfo: null,
  userId: '',
  activeChats: [],
  selectedChatId: null,
  chatCsaActive: false,
  setActiveChats: (chats) => set({ activeChats: chats }),
  setUserInfo: (data) => set({ userInfo: data, userId: data?.idCode || '' }),
  setSelectedChatId: (id) => set({ selectedChatId: id }),
  setChatCsaActive: (active) => set({ chatCsaActive: active }),
  selectedChat: () => {
    const selectedChatId = get().selectedChatId;
    return get().activeChats.find(c => c.id === selectedChatId);
  },
  unansweredChats: () => {
    return get().activeChats.filter(c => c.customerSupportId === '');
  },
  forwordedChats: () => { 
    const userId = get().userId;
    return get().activeChats.filter(c => 
      c.status === CHAT_STATUS.REDIRECTED && c.customerSupportId === userId
    ) || [];
  },
  unansweredChatsLength: () => get().unansweredChats().length,
  forwordedChatsLength: () => get().forwordedChats().length,
}));

export default useStore;
