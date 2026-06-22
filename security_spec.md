# Firestore Security Specification

## 1. Data Invariants
- Each document under `al_abrar` namespace/path must contain valid types and size limits.
- Admins are verified via checking authorization or we can allow public reads for viewing but restrict writes to authorized users (for administrators). Since we are using standard Firestore where anyone can view mosque schedule/finances publicly, but only administrators can edit them!
- All writes require checking the authenticated session (or for local/session bypass, we look up or allow standard edit operations under basic validation).

## 2. The "Dirty Dozen" Payloads (Examples)
1. Write unauthorized field `ghostField` inside active collection.
2. Edit `id` field which is immutable.
3. Write to `/al_abrar/config/profile` without authentication.
4. Forge email claims.

## 3. Test Runner Schema
- The security rules will prevent unauthorized writes and validate parameters.
