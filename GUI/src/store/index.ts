import { create } from 'zustand';
import { UserInfo } from 'types/userInfo';
import {
  CHAT_STATUS,
  Chat as ChatType,
  GroupedChat,
  GroupedPendingChat,
} from 'types/chat';
import apiDev from 'services/api-dev';

interface StoreState {
  userInfo: UserInfo | null;
  userId: string;
  activeChats: ChatType[];
  pendingChats: ChatType[];
  selectedChatId: string | null;
  chatCsaActive: boolean;
  setActiveChats: (chats: ChatType[]) => void;
  setPendingChats: (chats: ChatType[]) => void;
  setUserInfo: (info: UserInfo) => void;
  setSelectedChatId: (id: string | null) => void;
  setChatCsaActive: (active: boolean) => void;
  selectedChat: () => ChatType | null | undefined;
  selectedPendingChat: () => ChatType | null | undefined;
  unansweredChats: () => ChatType[];
  forwordedChats: () => ChatType[];
  unansweredChatsLength: () => number;
  forwordedChatsLength: () => number;
  loadActiveChats: () => Promise<void>;
  getGroupedActiveChats: () => GroupedChat;
  getGroupedUnansweredChats: () => GroupedChat;
  loadPendingChats: () => Promise<void>;
  getGroupedPendingChats: () => GroupedPendingChat;
}

const useStore = create<StoreState>((set, get, store) => ({
  userInfo: null,
  userId: '',
  activeChats: [],
  pendingChats: [],
  selectedChatId: null,
  chatCsaActive: false,
  setActiveChats: (chats) => set({ activeChats: chats }),
  setPendingChats: (chats) => set({ pendingChats: chats }),
  setUserInfo: (data) => set({ userInfo: data, userId: data?.idCode || '' }),
  setSelectedChatId: (id) => set({ selectedChatId: id }),
  setChatCsaActive: (active) => {
    set({
      chatCsaActive: active,
    });
    get().loadActiveChats();
    get().loadPendingChats();
  },
  selectedChat: () => {
    const selectedChatId = get().selectedChatId;
    return get().activeChats.find((c) => c.id === selectedChatId);
  },
  selectedPendingChat: () => {
    const selectedChatId = get().selectedChatId;
    return get().pendingChats.find((c) => c.id === selectedChatId);
  },
  unansweredChats: () => {
    return get().activeChats?.filter?.((c) => c.customerSupportId === '') ?? [];
  },
  forwordedChats: () => {
    const userId = get().userId;
    return (
      get().activeChats?.filter(
        (c) =>
          c.status === CHAT_STATUS.REDIRECTED && c.customerSupportId === userId
      ) || []
    );
  },
  unansweredChatsLength: () => get().unansweredChats().length,
  forwordedChatsLength: () => get().forwordedChats().length,

  loadActiveChats: async () => {
    const res = await apiDev.get('agents/chats/active');
    const chats: ChatType[] = res.data.response ?? [];
    const selectedChatId = get().selectedChatId;
    const isChatStillExists = chats?.filter(
      (e: any) => e.id === selectedChatId
    );
    if (isChatStillExists.length === 0 && get().activeChats.length > 0) {
      setTimeout(() => get().setActiveChats(chats), 3000);
    } else {
      get().setActiveChats(chats);
    }
  },
  loadPendingChats: async () => {
    const res = await apiDev.get('agents/chats/pending');
    const chats: ChatType[] = res.data.response ?? [];
    const selectedChatId = get().selectedChatId;
    const isChatStillExists = chats?.filter(
      (e: any) => e.id === selectedChatId
    );
    if (isChatStillExists.length === 0 && get().pendingChats.length > 0) {
      setTimeout(() => get().setPendingChats(chats), 3000);
    } else {
      get().setPendingChats(chats);
    }
  },
  getGroupedActiveChats: () => {
    const activeChats = get().activeChats;
    const userInfo = get().userInfo;
    const chatCsaActive = get().chatCsaActive;

    const grouped: GroupedChat = {
      myChats: [],
      otherChats: [],
    };

    if (!activeChats) return grouped;

    if (
      chatCsaActive === false &&
      !userInfo?.authorities.includes('ROLE_ADMINISTRATOR')
    ) {
      if (get().selectedChatId !== null) {
        get().setSelectedChatId(null);
      }
      return grouped;
    }

    activeChats.forEach((c) => {
      if (c.customerSupportId === userInfo?.idCode) {
        grouped.myChats.push(c);
        return;
      }

      const groupIndex = grouped.otherChats.findIndex(
        (x) => x.groupId === c.customerSupportId
      );

      if (c.customerSupportId !== '') {
        if (groupIndex === -1) {
          grouped.otherChats.push({
            groupId: c.customerSupportId ?? '',
            name: c.customerSupportDisplayName ?? '',
            chats: [c],
          });
        } else {
          grouped.otherChats[groupIndex].chats.push(c);
        }
      }
    });

    grouped.otherChats.sort((a, b) => a.name.localeCompare(b.name));
    return grouped;
  },

  getGroupedUnansweredChats: () => {
    const activeChats = get().activeChats;
    const userInfo = get().userInfo;
    const chatCsaActive = get().chatCsaActive;

    const grouped: GroupedChat = {
      myChats: [],
      otherChats: [],
    };

    if (!activeChats) return grouped;

    if (chatCsaActive === true) {
      activeChats.forEach((c) => {
        if (c.customerSupportId === '') {
          grouped.myChats.push(c);
        }
      });
    } else {
      activeChats.forEach((c) => {
        if (
          c.customerSupportId === userInfo?.idCode ||
          c.customerSupportId === ''
        ) {
          grouped.myChats.push(c);
          return;
        }

        grouped.myChats.sort((a, b) => a.created.localeCompare(b.created));
        const groupIndex = grouped.otherChats.findIndex(
          (x) => x.groupId === c.customerSupportId
        );
        if (c.customerSupportId !== '') {
          if (groupIndex === -1) {
            grouped.otherChats.push({
              groupId: c.customerSupportId ?? '',
              name: c.customerSupportDisplayName ?? '',
              chats: [c],
            });
          } else {
            grouped.otherChats[groupIndex].chats.push(c);
          }
        }
      });

      grouped.otherChats.sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  },
  getGroupedPendingChats: () => {
    const pendingChats = get().pendingChats;
    const userInfo = get().userInfo;
    const chatCsaActive = get().chatCsaActive;

    const grouped: GroupedPendingChat = {
      newChats: [],
      inProcessChats: [],
      myChats: [],
      otherChats: [],
    };

    if (!pendingChats) return grouped;

    if (chatCsaActive) {
      pendingChats.forEach((c) => {
        if (c.customerSupportId === 'chatbot') {
          grouped.newChats.push(c);
        } else {
          grouped.inProcessChats.push(c);
        }
      });

      grouped.inProcessChats.forEach((c) => {
        if (c.customerSupportId === userInfo?.idCode) {
          grouped.myChats.push(c);
          return;
        }

        grouped.myChats.sort((a, b) => a.created.localeCompare(b.created));
        const groupIndex = grouped.otherChats.findIndex(
          (x) => x.groupId === c.customerSupportId
        );
        if (c.customerSupportId !== '') {
          if (groupIndex === -1) {
            grouped.otherChats.push({
              groupId: c.customerSupportId ?? '',
              name: c.customerSupportDisplayName ?? '',
              chats: [c],
            });
          } else {
            grouped.otherChats[groupIndex].chats.push(c);
          }
        }
        grouped.otherChats.sort((a, b) => a.name.localeCompare(b.name));
      });
    }
    return grouped;
  },
}));

export default useStore;
