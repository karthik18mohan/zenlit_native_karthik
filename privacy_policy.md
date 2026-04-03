# Zenlit Privacy Policy

**Effective date:** April 3, 2026  
**Last updated:** April 3, 2026  
**Version:** v1.0

This markdown file mirrors the live Privacy Policy page published at `/privacy`.

## Summary
Zenlit is a nearby social app with profile setup, posts, direct messaging, and optional push notifications. We collect only the data needed to run those features.

## Data we collect
- **Account data:** email used for OTP/passwordless authentication.
- **Profile data:** display name, username, date of birth, gender.
- **Optional profile data:** bio, social handles, profile image, banner image.
- **Location data:** foreground location coordinates and rounded coordinates used to match nearby users.
- **Messaging data:** message text, sender/receiver IDs, timestamps, delivery/read metadata.
- **Post data:** post text, optional post image, timestamps.
- **Notification data:** Expo push token and notification preferences.
- **Feedback data:** user-submitted feedback content.

## Why we use it
- Authenticate and secure accounts.
- Show nearby users and nearby posts.
- Enable profile and social identity features.
- Deliver direct messages.
- Send message push notifications (if enabled).
- Support account deletion and service operations.

## Where data is stored
- **Supabase** for auth, database, storage buckets, and edge functions.
- **Expo Notifications** for push token issuance and notification delivery routing.

## Retention and deletion
We keep account data while your account is active. You can delete your account:
- In-app: **Profile → Menu → Delete Account**
- Web deletion page: `/delete-account`

Account deletion triggers backend cleanup for profile, location, posts, messages, and related records, subject to short operational backup windows.

## Contact
Support and privacy requests: `support@zenlit.app`
