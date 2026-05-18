# Security Specification for Rayan Dental Care

## Data Invariants
- An appointment cannot be created without a valid patient name and phone number.
- Only admins can read all appointments.
- Users can create appointments (anonymous or authenticated).
- Once an appointment status is 'confirmed' or 'completed', it cannot be modified by a non-admin.
- Categories are read-only for public, writeable only by admins.
- Admins collection is restricted to existing admins for read/write.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create an appointment with a fake `userId`.
2. **State Shortcutting**: Attempt to create an appointment with status 'confirmed'.
3. **Resource Poisoning**: High-size string in `patientName`.
4. **Unauthorized Read**: Anonymous user attempting to list `/appointments`.
5. **Unauthorized Admin Write**: Non-admin attempting to create a document in `/admins`.
6. **Immutable Field Attack**: Attempting to change `createdAt` on an appointment.
7. **Invalid ID**: Using a 2KB string as a document ID.
8. **PII Leak**: Non-admin attempting to get a specific appointment by ID.
9. **Category Tampering**: Non-admin attempting to delete a category.
10. **Query Scraping**: Authenticated user trying to `list` appointments without an admin role.
11. **Status Update Gap**: Trying to update `patientName` on a 'confirmed' appointment.
12. **Missing System Fields**: Creating appointment without `createdAt`.

## Firestore Rules Test (Abstract)
The tests will ensure:
- `get` on `/appointments/{id}` is only allowed for Admin or owner.
- `list` on `/appointments` is only allowed for Admin.
- `create` on `/appointments` is allowed for anyone if payload is valid.
- `update` on `/appointments` is restricted (status transitions).
