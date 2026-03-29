# Anandstudio

## Current State
- NavBar has Login/Logout buttons (Internet Identity) visible to all visitors
- Admin panel at /admin uses Internet Identity for authentication
- Client galleries accessed via /gallery/:token with optional access code
- NavBar shows Admin button when user is logged in as admin

## Requested Changes (Diff)

### Add
- A subtle 3-dot (⋮) icon button in the NavBar (top right, visible always)
- When clicked, opens a popover/modal with a "Client Gallery Access" form:
  - Option 1: Enter gallery token/code to open gallery (text input + button to navigate to /gallery/<entered value>)
  - Option 2: If they have a full link, they can also paste just the token portion
- The form should say something like "Enter your gallery code or link provided by Anandstudio"

### Modify
- NavBar: Remove the visible Login/Logout buttons for Internet Identity from the public navbar
- NavBar: Remove the Admin button from public view (admin can still navigate directly to /admin)
- AdminPage: Keep Internet Identity login intact (admin still needs it to authenticate)

### Remove
- Login/Logout buttons from NavBar (public facing)
- Admin button from NavBar
- useInternetIdentity and useIsAdmin imports from NavBar (no longer needed there)

## Implementation Plan
1. Update NavBar.tsx:
   - Remove Login/Logout buttons, Admin button, and related II hooks
   - Add a MoreVertical (3-dot) icon button at the right side of navbar
   - Use a Popover or Dialog that opens when 3-dot is clicked
   - Inside the popover: an input for gallery code/token + a button to navigate to /gallery/<token>
   - Clean and minimal design matching dark luxury theme
2. AdminPage.tsx: No changes needed (Internet Identity login stays)
