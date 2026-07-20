import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });
export default function RootLayout() { const hydrate = useAuth((state) => state.hydrate); useEffect(() => { void hydrate(); }, [hydrate]); return <QueryClientProvider client={queryClient}><Stack screenOptions={{ headerShown: false }} /></QueryClientProvider>; }
