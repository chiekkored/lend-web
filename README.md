# lend-web

Next.js and shadcn/ui web project for Lend.

## Routes

- `/` shows the temporary landing page.
- `/admin` shows the Firebase-protected admin console.
- `admin.<base_url_here>.com` is rewritten to `/admin` by `middleware.ts`. Override the host with `NEXT_PUBLIC_ADMIN_HOST`.

## Admin Auth

The admin console uses Firebase Auth email/password sign-in. The signed-in Firebase user must have a custom claim:

```json
{
  "admin": true
}
```

Copy `.env.example` to `.env.local` and fill in the Firebase public web config before running locally.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```
