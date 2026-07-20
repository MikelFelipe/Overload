import { Redirect } from 'expo-router';
import { Loading } from '@/components/Ui';
import { useAuth } from '@/store/auth';
export default function Index() { const { user, loading } = useAuth(); if (loading) return <Loading />; return <Redirect href={user ? '/dashboard' : '/login'} />; }
