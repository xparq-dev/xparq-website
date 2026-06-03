# XPARQ App — legal pages (on xparq.me)

**xparq.me** is the corporate landing; these pages are the **XPARQ App** product policies only (synced from the mobile app):

- https://xparq.me/products/xparq-app/legal/privacy-policy.html (EN) — `?lang=th` → Thai
- https://xparq.me/products/xparq-app/legal/terms.html
- https://xparq.me/products/xparq-app/legal/community-guidelines.html

Legacy `/legal/*` URLs redirect here via `vercel.json`.

## Regenerate after app policy changes

```powershell
node D:\XPARQ\xparq_web\scripts\sync_legal_from_mobile.mjs
```

Source of truth: `xparq_mobile/apps/mobile/lib/features/profile/data/legal_documents.dart`
