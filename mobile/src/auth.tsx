import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@overload/shared';
import { api, mobileToken } from './api';

interface AuthValue { user: User | null; loading: boolean; setUser: (user: User | null) => void; logout: () => Promise<void>; }
const AuthContext = createContext<AuthValue | null>(null);
export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { mobileToken.get().then((token) => token ? api.session().then((r) => setUser(r.user)).catch(() => mobileToken.clear()) : undefined).finally(() => setLoading(false)); }, []);
  const logout = async () => { await api.logout().catch(() => undefined); await mobileToken.clear(); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, setUser, logout }}>{children}</AuthContext.Provider>;
};
export const useMobileAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('useMobileAuth must be used inside AuthProvider'); return value; };
