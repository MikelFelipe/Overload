# Overload Unified Client

This folder is the unified iOS, Android, and Web client built with Expo and Expo
Router. Set `EXPO_PUBLIC_API_URL` to an address reachable from the phone,
emulator, or browser, then run `npm install` and `npm start`.

The Node/Express TypeScript API remains in `backend/`. Authentication uses a
platform-safe bearer-token storage adapter shared by native and web builds.
