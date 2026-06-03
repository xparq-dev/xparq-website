# xparq.me — XPARQ Holdings (corporate site)

**xparq.me** is the company landing site only: About, Products overview, Contact, and per-product marketing pages.

It is **not** the primary host for XPARQ App user policies. Those live under the **XPARQ App** product:

- `/products/xparq-app/legal/privacy-policy.html`
- `/products/xparq-app/legal/terms.html`
- `/products/xparq-app/legal/community-guidelines.html`

Source of truth for app policy text: `xparq_mobile/apps/mobile/lib/features/profile/data/legal_documents.dart`

Regenerate web pages:

```powershell
node scripts/sync_legal_from_mobile.mjs
```

Deploy: Vercel project `xparq-website` (GitHub `xparq-dev/xparq-website`).
