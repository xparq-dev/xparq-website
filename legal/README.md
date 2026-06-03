# Legal pages (xparq.me)

Public policies synced from the mobile app:

- https://xparq.me/legal/privacy-policy.html (EN) — `?lang=th` → Thai
- https://xparq.me/legal/terms.html
- https://xparq.me/legal/community-guidelines.html

## Regenerate after app policy changes

```powershell
node D:\XPARQ\xparq_web\scripts\sync_legal_from_mobile.mjs
```

Source of truth: `xparq_mobile/apps/mobile/lib/features/profile/data/legal_documents.dart`

## Deploy

Upload `legal/` folder and updated site HTML footers to hosting for xparq.me.
