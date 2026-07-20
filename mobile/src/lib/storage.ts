import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const key = 'overload.access-token';
const webStorage = () => (typeof window !== 'undefined' ? window.localStorage : null);

export const tokenStorage = {
  async get() { return Platform.OS === 'web' ? webStorage()?.getItem(key) ?? null : AsyncStorage.getItem(key); },
  async set(token: string) { if (Platform.OS === 'web') webStorage()?.setItem(key, token); else await AsyncStorage.setItem(key, token); },
  async clear() { if (Platform.OS === 'web') webStorage()?.removeItem(key); else await AsyncStorage.removeItem(key); },
};
