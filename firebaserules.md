# Firestore Security Rules — Atlas OS
> **To paste into Firebase Console:** copy the contents of `firestore.rules` — raw rules only, no markdown.
> This `.md` file is for AI agent reference (schema docs + annotated rules).
> **Last updated:** 2026-04-21

---

## Project Info

| Field | Value |
|---|---|
| Firebase Project | atlas-os (new — paste project ID here when known) |
| Owner UID | `QZ62mytbllhPt7wWkv6gKtmz31l1` |
| Canonical rules file | `atlas-os/firestore.rules` |

---

## Collections

| Collection | Purpose |
|---|---|
| `users` | User profiles, display name, preferences |
| `presence` | Online/active user tracking |

> **Note for Gemini / AI agents:** When you add a new collection to the app, add it here AND update `firestore.rules`. Never let the two files drift out of sync. Always copy `firestore.rules` verbatim into the Firebase Console — do not paste from this `.md`.

---

## Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ──────────────────────────────────────────────
    //  Helper Functions
    // ──────────────────────────────────────────────

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner() {
      return request.auth != null
        && request.auth.uid == 'QZ62mytbllhPt7wWkv6gKtmz31l1';
    }

    function validString(field, maxLen) {
      return request.resource.data[field] is string
        && request.resource.data[field].size() <= maxLen;
    }

    // ──────────────────────────────────────────────
    //  Users
    // ──────────────────────────────────────────────
    match /users/{userId} {
      allow read: if isAuthenticated();

      allow create: if isAuthenticated()
        && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['displayName'])
        && validString('displayName', 32);

      allow update: if isAuthenticated()
        && request.auth.uid == userId;

      allow delete: if isOwner();
    }

    // ──────────────────────────────────────────────
    //  Presence
    // ──────────────────────────────────────────────
    match /presence/{userId} {
      allow read: if true;

      allow write: if isAuthenticated()
        && request.auth.uid == userId;
    }

    // ──────────────────────────────────────────────
    //  Catch-all deny
    // ──────────────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
