# Anandstudio

## Current State
- Photography site with dark luxury design
- Admin panel at `/admin` protected by Internet Identity login
- Client galleries: admin creates galleries, shares a unique link (`/gallery/:token`), customers view photos, select favorites, add note, and submit
- Photo selection uses a checkmark toggle per photo
- No access code option -- only link-based access
- Admin is first Internet Identity user to claim admin via `_initializeAccessControlWithSecret`

## Requested Changes (Diff)

### Add
- Optional **access code** field on client galleries: admin can set a code (e.g. `WEDDING2024`) when creating a gallery; customers must enter it before viewing photos
- **Admin first-time setup flow**: on the admin login/access page, show a dedicated "Claim Admin" section where the user enters the Caffeine admin token to register as the first admin (calls `_initializeAccessControlWithSecret`)
- Backend: `accessCode` optional field on `ClientGallery` type; `createClientGallery` accepts optional access code; `getClientGalleryByToken` returns `hasCode: Bool` flag; new `verifyGalleryCode(token, code)` query that returns true/false without revealing gallery data

### Modify
- Photo selection UI on `/gallery/:token`: replace single-tap checkmark toggle with explicit **"Want" / "Skip"** button pair per photo, plus a "Select All" shortcut. Selected = want, unselected/skipped = don't want. Visual: gold border + check for selected, dim border for skipped.
- Admin first-time setup: after Internet Identity login, if the user is not recognized (role lookup fails), show a "Register as Admin" form where they paste the admin setup token
- `ClientGalleriesTab`: add optional "Access Code" input in the create form; show the code alongside the share link in the gallery list
- `ClientGalleryPage`: if gallery has an access code, show a code-entry screen before revealing photos

### Remove
- Nothing

## Implementation Plan
1. Regenerate `main.mo` to add `accessCode: ?Text` to `ClientGallery`, update `createClientGallery(name, photos, accessCode: ?Text)`, add `verifyGalleryCode(token, code): Bool` query, update `getClientGalleryByToken` to include `hasCode: Bool` in response
2. Update `backend.d.ts` to match new signatures
3. Update `ClientGalleriesTab.tsx`: add access code input, show code in gallery card
4. Update `ClientGalleryPage.tsx`: add code entry screen if gallery `hasCode`, verify before showing photos; replace checkmark toggle with Want/Skip buttons
5. Update `AdminPage.tsx`: add first-time admin setup form after login when user role is unknown
