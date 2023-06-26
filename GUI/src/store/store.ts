import { create } from 'zustand';
import { UserInfo } from 'types/userInfo';

interface StoreState {
  userInfo: UserInfo | null;
  setUserInfo: (data: UserInfo) => void;
}

const useUserInfoStore = create<StoreState>((set) => ({
  userInfo: null,
  setUserInfo: (data: UserInfo) => set({ userInfo: data }),
}));


export default useUserInfoStore;
