import { create } from "zustand";
import { LoggedInUser } from "@/lib/types/users";

interface UserState {
  user: LoggedInUser | null;
  setUser: (user: LoggedInUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
