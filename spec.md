# Anandstudio

## Current State
Admin panel uses Internet Identity (blockchain login) via `useInternetIdentity` hook. All admin backend functions check `AccessControl.hasPermission(accessControlState, caller, #admin)` which requires a valid Internet Identity principal. The admin must log in with Internet Identity and claim admin via a setup token.

## Requested Changes (Diff)

### Add
- Password-based admin login: identifier (email or phone) + password stored in backend
- Backend functions: `isAdminSetup()`, `setupAdmin(id, pass)`, `adminLogin(id, pass)`, `adminLogout(token)`, `verifyAdminToken(token)`, `changeAdminPassword(token, currentPass, newPass)`
- `useAdminAuth` hook that stores session token in localStorage and exposes `sessionToken`, `login`, `logout`, `isAuthenticated`, `isSetup`
- First-time setup screen at `/admin` when no admin exists yet
- Login screen with email/phone + password fields

### Modify
- All admin backend functions now take `sessionToken: Text` as first parameter instead of relying on Internet Identity principal
- `useActor.ts` - remove Internet Identity dependency, return anonymous actor always
- `useQueries.ts` - all admin mutations now read sessionToken from `useAdminAuth` and pass it as first arg
- `AdminPage.tsx` - replace II login/logout with password login UI
- Remove `useInternetIdentity` hook usage from AdminPage and useActor

### Remove
- Internet Identity (MixinAuthorization, AccessControl) from backend
- `_initializeAccessControlWithSecret`, `isCallerAdmin`, `getCallerUserRole`, `assignCallerUserRole` functions
- `userProfiles` management functions
- Internet Identity login button from admin panel

## Implementation Plan
1. Rewrite `main.mo` with password-based session auth; all admin ops take sessionToken as first param
2. Rewrite `migration.mo` to map old state (accessControlState, userProfiles) to new state (adminIdentifier, adminPassword vars)
3. Update `backend.d.ts` with new function signatures
4. Create `src/frontend/src/hooks/useAdminAuth.ts` with localStorage session management
5. Update `useActor.ts` - remove II, always return anonymous actor
6. Update `useQueries.ts` - pass sessionToken to all admin mutations
7. Update `AdminPage.tsx` - use password login UI (setup screen + login screen)
8. All admin tab components remain mostly the same (hooks handle token passing)
