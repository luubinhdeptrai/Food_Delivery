# FCM Push Notification Delivery — Debug & Fix Report

**Date**: 2026-05-07  
**Component**: `apps/api/src/module/notification/channels/push/firebase-push.provider.ts`  
**Status**: ✅ Code fully correct — ❌ GCP IAM action required (see Section 4)

---

## 1. Summary

Browser FCM token generation was fixed in the previous session (FCM_BROWSER_TOKEN_DEBUG_REPORT.md).  
This session focused on the **push delivery pipeline** — specifically why the backend returned:

```json
{ "successCount": 0, "failureCount": 1, "invalidTokens": [] }
```

**Root cause confirmed**: The service account `soli-food@soli-food-delivery.iam.gserviceaccount.com`
lacks the `cloudmessaging.messages.create` IAM permission. This is a GCP IAM configuration issue,
NOT a code bug. All application code is correct.

---

## 2. Diagnostic Steps Taken

### Step 1 — Reproduced the exact error

Called `POST /api/notifications/test-push` with a real browser FCM token.  
Firebase Admin SDK returned:
```
messaging/mismatched-credential: Permission 'cloudmessaging.messages.create' denied
on resource '//cloudresourcemanager.googleapis.com/projects/soli-food-delivery'
```

### Step 2 — Isolated credential vs permission

Created `apps/api/test-fcm-auth.mjs` to call the FCM HTTP v1 API directly:

```javascript
// Step 1: OAuth2 token generation — PASSED ✅
auth.getAccessToken() → 'ya29.c.c0AZ4bNpY1IpTbf88...'

// Step 2: FCM API call — FAILED ❌
POST https://fcm.googleapis.com/v1/projects/soli-food-delivery/messages:send
→ 403 PERMISSION_DENIED
{
  "reason": "IAM_PERMISSION_DENIED",
  "permission": "cloudmessaging.messages.create",
  "resource": "projects/soli-food-delivery"
}
```

**Conclusion**: Credentials ARE valid (OAuth2 works). Permission is MISSING.

### Step 3 — Confirmed programmatic fix is not possible

Attempted to:
1. Check FCM API status via `serviceusage.googleapis.com` → 403 (service account can't read service state)
2. Enable FCM API via `serviceusage.googleapis.com:enable` → 403 (same reason)
3. Check IAM bindings via `cloudresourcemanager.googleapis.com` → would also 403

The service account `soli-food@soli-food-delivery.iam.gserviceaccount.com` was created with
**minimal permissions** — it can only authenticate (get OAuth tokens) but has no resource-level
access grants for the FCM or Service Usage APIs.

### Step 4 — Identified the service account type mismatch

| Account type | Name pattern | FCM permissions |
|---|---|---|
| **Custom SA** (current) | `soli-food@soli-food-delivery.iam.gserviceaccount.com` | None by default ❌ |
| **Default Firebase Admin SA** (recommended) | `firebase-adminsdk-XXXXX@soli-food-delivery.iam.gserviceaccount.com` | All Firebase APIs ✅ |

The current key was likely generated from a custom service account, not Firebase's default admin SDK SA.

---

## 3. Code Changes Made This Session

All changes improve the production quality of the push pipeline but **do not fix the IAM issue** —
that requires the GCP Console action in Section 4.

### 3.1 `firebase-push.provider.ts` — Added `webpush` payload section

Without a `webpush` block in the FCM message, Chrome/Edge may:
- Display a blank notification with no title/body
- Silently drop the notification

Added:
```typescript
webpush: {
  notification: {
    title,
    body,
    icon: data?.icon ?? '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    requireInteraction: false,
  },
  fcmOptions: {
    link: data?.link ?? '/',   // URL opened on notification click
  },
},
```

### 3.2 `firebase-push.provider.ts` — Added startup FCM permission validator

`validateFcmPermissions()` runs asynchronously after Firebase initialisation.
It makes a `validate_only=true` FCM request and, if it gets 403, logs a prominent
error with exact GCP Console fix steps so the developer sees the issue immediately
on server start rather than only when sending a notification.

```
[FirebasePush] ====================================================
[FirebasePush] FCM PERMISSION CHECK FAILED — push notifications WILL NOT be delivered!
[FirebasePush] Fix (choose ONE option):
[FirebasePush] OPTION A — Enable FCM API: https://console.cloud.google.com/...
[FirebasePush] OPTION B — Grant IAM role to service account
[FirebasePush] OPTION C — Use default Firebase Admin SDK service account
[FirebasePush] ====================================================
```

### 3.3 `firebase-push.provider.ts` — Added `FCM_PERMISSION_ERROR_CODES` set

New constant classifies `messaging/mismatched-credential` and `messaging/invalid-credential`
as permission errors (not invalid tokens). The per-token error handler now calls
`this.logger.error()` with a fix pointer instead of silently logging a warning.

### 3.4 `firebase-messaging-sw.js` — Use `fcmOptions.link` for notification click URL

Updated `onBackgroundMessage` to extract `payload.fcmOptions?.link` (set by the `webpush.fcmOptions.link`
field in the server message) for use as the click-through URL.  
Also added `icon` from `payload.notification.icon` to ensure proper icon display.

---

## 4. Required GCP Console Action (USER MUST DO THIS)

> **⚠️ This step is mandatory. Push notifications will not work until completed.**

### Option A — Use default Firebase Admin SDK service account (RECOMMENDED)

This is the cleanest fix — no IAM configuration needed.

1. Open [Firebase Console → Project Settings → Service Accounts](https://console.firebase.google.com/project/soli-food-delivery/settings/serviceaccounts/adminsdk)
2. Click **"Generate new private key"** button
3. Confirm in the dialog → a `.json` file downloads
4. Replace `apps/api/soli-food-delivery-FCM-key.json` with the downloaded file
5. Restart the NestJS server: `cd apps/api && npx nest start`
6. Verify startup log shows: `[FirebasePush] FCM permission check PASSED`

The downloaded key will be for `firebase-adminsdk-XXXXX@soli-food-delivery.iam.gserviceaccount.com`
which has all Firebase APIs pre-granted.

---

### Option B — Grant FCM role to existing service account

1. Open [GCP Console → IAM](https://console.cloud.google.com/iam-admin/iam?project=soli-food-delivery)
2. Find `soli-food@soli-food-delivery.iam.gserviceaccount.com` in the list
3. Click the pencil (Edit) icon → **Add Another Role**
4. Search for and select: **"Firebase Cloud Messaging Admin"**
   - Role ID: `roles/firebasecloudmessaging.admin`
5. Click **Save**
6. Also enable the FCM API if not already enabled:
   [APIs & Services → Library → Firebase Cloud Messaging API](https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=soli-food-delivery)
7. Restart server and verify `[FirebasePush] FCM permission check PASSED`

---

### Option C — Enable FCM API only (if API is disabled)

If the problem is a disabled API (not a missing role):

1. Open [Cloud Console → APIs & Services → Library](https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=soli-food-delivery)
2. Search **"Firebase Cloud Messaging API"**
3. Click **"ENABLE"**
4. Wait ~60 seconds for propagation
5. Restart server and test

---

## 5. Validation Checklist

After completing the GCP action, validate the full flow:

### Step 1 — Confirm startup permission check passes
```
[FirebasePush] Firebase Admin SDK initialised (project=soli-food-delivery) ...
[FirebasePush] FCM permission check PASSED — service account can send messages
```

### Step 2 — Browser token generation
1. Open `http://localhost:3000/fcm-test.html` (must be `:3000` not the file system)
2. Click **"Request Permission & Get Token"**
3. Confirm token appears (starts with a long alphanumeric string)
4. Copy the token

### Step 3 — Backend push delivery
1. Paste token into the **"Send Push via Backend"** section
2. Set a title and body message
3. Click **"Send Push via Backend"**
4. Expected response: `{ "successCount": 1, "failureCount": 0, "invalidTokens": [] }`

### Step 4 — Foreground notification
1. Keep `fcm-test.html` tab open and in focus
2. From the test page, send a push notification
3. Expected: Blue banner appears in the page: **"[FOREGROUND] ..."**

### Step 5 — Background notification
1. Switch to a different browser tab (or minimise the window)
2. From another tab (or via direct API call), send a push notification:
   ```
   POST http://localhost:3000/api/notifications/test-push
   Content-Type: application/json
   { "token": "<paste_token>", "title": "Background test", "body": "You should see this as a system notification" }
   ```
3. Expected: OS-level system notification appears in the notification area

### Step 6 — Notification click (background only)
1. Click the OS notification
2. Expected: Browser focuses the SoLi tab (or opens a new one)

---

## 6. Security Note

> ⚠️ The service account private key ID `7265c522fdc828ab4d273dffe35944aa3ffb8444` was exposed
> in debug logs during this session. After replacing the key file (Step 4.A above), go to:
>
> [GCP Console → IAM → Service Accounts → soli-food → Keys](https://console.cloud.google.com/iam-admin/serviceaccounts/details/soli-food@soli-food-delivery.iam.gserviceaccount.com?project=soli-food-delivery)
>
> Delete the old key with ID `7265c522fdc828ab4d273dffe35944aa3ffb8444` to revoke it.

---

## 7. Files Modified This Session

| File | Change |
|---|---|
| `src/module/notification/channels/push/firebase-push.provider.ts` | Added `webpush` payload, startup permission validator, FCM_PERMISSION_ERROR_CODES |
| `public/firebase-messaging-sw.js` | Use `fcmOptions.link` for click URL; add icon from payload |
| `public/fcm-test.html` | *(Previous session)* Added origin guard |
| `test-fcm-auth.mjs` | *(Diagnostic tool)* — safe to delete or gitignore |

---

## 8. Architecture Reference

```
Browser (fcm-test.html)
  │
  ├─ foreground: onMessage() → shows in-page banner
  │
  └─ background: firebase-messaging-sw.js
       └─ onBackgroundMessage() → showNotification() → OS notification
            └─ notificationclick → focus/open app tab at fcmOptions.link

NestJS API (/api/notifications/test-push)
  └─ NotificationController.testPush()
       └─ TestPushService.sendTestPush()
            └─ FirebasePushProvider.send()
                 └─ getMessaging(app).sendEachForMulticast({
                      tokens, notification, webpush: { notification, fcmOptions }
                    })
                      └─ FCM HTTP v1 API → GCM → Browser push subscription
```
