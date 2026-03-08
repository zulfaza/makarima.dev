# makarima.dev

TanStack Start SSR app configured for Cloudflare Workers deploys.

## Local dev

```bash
bun install
bun run dev
```

The Vite dev server runs on `http://localhost:3000`.

## Cloudflare deploy

1. Install Wrangler auth locally:

```bash
npx wrangler login
```

Or set `CLOUDFLARE_API_TOKEN` for non-interactive deploys.

2. Verify auth:

```bash
npx wrangler whoami
```

3. Build and deploy:

```bash
bun run deploy
```

The Worker entrypoint is defined in `wrangler.jsonc` and points at `@tanstack/react-start/server-entry`.
