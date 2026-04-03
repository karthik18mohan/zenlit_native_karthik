# Legal Pages (Privacy + Terms)

Zenlit now ships public legal routes using Expo Router:
- `/privacy`
- `/terms`

These pages are implemented as app routes so they are exported in the web build and can be reviewed by Play Store reviewers on public HTTPS URLs.

## Source files
- Privacy page route: `app/privacy.tsx`
- Terms page route: `app/terms.tsx`
- Auth consent checkbox gate: `app/auth/index.tsx`
- Existing-user legal gate: `app/onboarding/legal-consent.tsx`
- Shared legal constants (URLs, dates, versions, support email): `src/constants/legal.ts`
- Legal acceptance persistence service: `src/services/legalAcceptanceService.ts`
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

## Mandatory acceptance flow
1. Signup/auth now includes an unchecked required checkbox before OTP can be requested.
2. The consent line uses clickable links to the live Terms and Privacy URLs from `LEGAL_URLS`.
3. Every authenticated user is checked for acceptance of the latest terms/privacy versions.
4. Users without a matching acceptance record are redirected to `/onboarding/legal-consent` and blocked from core app screens until acceptance is saved.
5. The legal-consent screen keeps **Log out** and **Delete account** actions available.

## Acceptance storage
Acceptance is persisted in `public.legal_acceptances`.

Columns:
- `user_id` (UUID, PK, references `auth.users(id)`)
- `terms_version` (text)
- `privacy_version` (text)
- `accepted_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Migration file:
- `supabase/migrations/20260403110000_create_legal_acceptances_table.sql`

## Versioning model
- `LEGAL_VERSION` remains the base release tag.
- `TERMS_VERSION` and `PRIVACY_VERSION` are explicit constants (currently mapped to `LEGAL_VERSION`) and are written to acceptance records.
- When either document changes materially, bump its corresponding version constant and users will be re-gated automatically.

## Deploy steps (required)
1. Apply database migrations (Supabase CLI):
   - `supabase db push`
2. Build static web output:
   - `npm run build`
3. Deploy the generated `dist/` folder to HTTPS hosting (Vercel, Netlify, Cloudflare Pages, S3+CloudFront, etc.).
4. Ensure routes `/privacy`, `/terms`, and `/delete-account` are publicly reachable without login.
5. Set `EXPO_PUBLIC_WEB_BASE_URL` to that live origin in your app environment so mobile links open the correct public pages.

## Updating legal content
1. Update route files (`app/privacy.tsx`, `app/terms.tsx`).
2. If version/date changes, update constants in `src/constants/legal.ts`.
3. Rebuild and redeploy web output.

## Markdown mirrors
- `privacy_policy.md`
- `terms_of_service.md`

These are repository mirrors only. The reviewable public pages are the web routes above.
