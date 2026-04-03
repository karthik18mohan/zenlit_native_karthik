# Legal Pages (Privacy + Terms)

Zenlit now ships public legal routes using Expo Router:
- `/privacy`
- `/terms`

These pages are implemented as app routes so they are exported in the web build and can be reviewed by Play Store reviewers on public HTTPS URLs.

## Source files
- Privacy page route: `app/privacy.tsx`
- Terms page route: `app/terms.tsx`
- Shared legal constants (URLs, dates, version, support email): `src/constants/legal.ts`
- Reusable legal page UI component: `src/components/legal/LegalDocumentScreen.tsx`

## Single source of truth for URLs
Configure one base URL and derive all legal links from it.

Set these env vars before build:
- `EXPO_PUBLIC_WEB_BASE_URL` (example: `https://your-domain.com`)
- `EXPO_PUBLIC_SUPPORT_EMAIL` (example: `support@your-domain.com`)

Derived URLs used in-app:
- Privacy: `${EXPO_PUBLIC_WEB_BASE_URL}/privacy`
- Terms: `${EXPO_PUBLIC_WEB_BASE_URL}/terms`
- Deletion: `${EXPO_PUBLIC_WEB_BASE_URL}/delete-account`

## Deploy steps (required)
1. Build static web output:
   - `npm run build`
2. Deploy the generated `dist/` folder to HTTPS hosting (Vercel, Netlify, Cloudflare Pages, S3+CloudFront, etc.).
3. Ensure routes `/privacy`, `/terms`, and `/delete-account` are publicly reachable without login.
4. Set `EXPO_PUBLIC_WEB_BASE_URL` to that live origin in your app environment so mobile links open the correct public pages.

## Updating legal content
1. Update route files (`app/privacy.tsx`, `app/terms.tsx`).
2. If version/date changes, update constants in `src/constants/legal.ts`.
3. Rebuild and redeploy web output.

## Markdown mirrors
- `privacy_policy.md`
- `terms_of_service.md`

These are repository mirrors only. The reviewable public pages are the web routes above.
