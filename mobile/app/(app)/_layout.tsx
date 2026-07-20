import { Redirect, Stack } from 'expo-router';
import { Loading } from '@/components/Ui';
import { useAuth } from '@/store/auth';
export default function AppLayout() { const { user, loading } = useAuth(); if (loading) return <Loading />; if (!user) return <Redirect href="/login" />; return <Stack screenOptions={{ headerShown: false }} />; }
