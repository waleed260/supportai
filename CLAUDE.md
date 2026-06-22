# SupportAI Monorepo

## Structure
- `apps/web/` - Next.js web dashboard (migrating to apps/web)
- `apps/mobile/` - Expo React Native mobile app
- `packages/` - Shared libraries

## Key Documents
- `apps/mobile/AGENTS.md` - Full mobile architecture spec

## Development
```bash
npm install              # Install all workspace dependencies
npm run build:packages   # Build shared packages first
npm run dev              # Web app
npm run dev:mobile       # Mobile app
```

## Expo SDK & RN
Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any Expo code.
