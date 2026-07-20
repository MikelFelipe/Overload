import { create } from 'zustand';
import { User } from '@overload/shared';
import { api } from '@/lib/api';
import { tokenStorage } from '@/lib/storage';
type AuthState = { user: User | null; loading: boolean; hydrate: () => Promise<void>; setUser: (user: User | null) => void; logout: () => Promise<void> };
export const useAuth = create<AuthState>((set) => ({
  user: null, loading: true,
  hydrate: async () => { try { if (await tokenStorage.get()) set({ user: (await api.session()).user }); } catch { await tokenStorage.clear(); } finally { set({ loading: false }); } },
  setUser: (user) => set({ user }),
  logout: async () => { await api.logout().catch(() => undefined); await tokenStorage.clear(); set({ user: null }); },
}));
