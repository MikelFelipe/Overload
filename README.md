# Overload

This repository contains the unified Overload Expo Router client and Express backend for the authentication and workout dashboard experience.

## Applications

- `mobile/` — one Expo Router application targeting iOS, Android, and Web.
- `backend/` — Express/TypeScript API and Supabase integration.
- `shared/` — shared TypeScript contracts.

Run `npm run dev` to start the API and unified client together. Set `EXPO_PUBLIC_API_URL` for the client when the API is not running at `http://localhost:5000/api`.

Run `npm run validate` for strict typechecking, component platform checks, tests, and a web export.

## Documentation automation

- Run `npm run docs:generate` to regenerate the project documentation from the current repository snapshot.
- Run `npm run docs:watch` to start a watcher that updates the documentation automatically when files change.
- Manual sections can be preserved by placing content between the markers `<!-- MANUAL SECTION START -->` and `<!-- MANUAL SECTION END -->` inside [Overload_Documentation.md](Overload_Documentation.md).
