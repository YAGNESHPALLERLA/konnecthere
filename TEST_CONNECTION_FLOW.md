# Connection Feature Test Guide

## Test Flow Checklist

### Prerequisites
1. Have at least 2 test user accounts ready
2. User A: Test user account
3. User B: Another test user account

### Test Steps

#### 1. Send Connection Request
- [ ] Login as User A
- [ ] Navigate to `/konnect` page
- [ ] Find User B in the list
- [ ] Click "Konnect" button
- [ ] Verify:
  - Button shows "Connecting..." while processing
  - Button changes to "Pending" after success
  - Toast message appears: "Connection request sent successfully" or from API
  - No 500 errors in console
  - No database errors

#### 2. Check Notifications (User B)
- [ ] Login as User B
- [ ] Check bell icon in navbar
- [ ] Verify:
  - Badge shows count of pending requests
  - Click bell icon opens dropdown
  - User A appears in pending requests list
  - Shows User A's name, email, title, location
  - Accept and Reject buttons are visible

#### 3. Accept Connection Request
- [ ] As User B, click "Accept" button in notification dropdown
- [ ] Verify:
  - Button shows "Processing..." while handling
  - Toast message: "Connection accepted! You can now message this user."
  - Request disappears from notification list
  - Badge count decreases
  - No errors in console

#### 4. Verify Connection Status
- [ ] As User A, refresh `/konnect` page
- [ ] Find User B in the list
- [ ] Verify:
  - Button shows "Message" (not "Konnect" or "Pending")
  - Connection status is ACCEPTED

#### 5. Test Messaging
- [ ] As User A, click "Message" button on User B's card
- [ ] Verify:
  - Redirects to messages page
  - Conversation appears in messages list
  - Can send messages
  - Messages are delivered correctly

#### 6. Messages Page Verification
- [ ] Navigate to `/messages` page
- [ ] Verify:
  - Only shows User B (accepted connection)
  - Does NOT show all users
  - Only accepted connections are visible

#### 7. Test Reject Flow (Alternative)
- [ ] As User A, send connection request to User C
- [ ] As User C, click "Reject" in notification dropdown
- [ ] Verify:
  - Request is removed from notifications
  - Toast shows: "Connection rejected"
  - User A can send a new request (rejected connections can be re-requested)

#### 8. Test Duplicate Prevention
- [ ] As User A, try to click "Konnect" on User B again (already connected)
- [ ] Verify:
  - Button is disabled or shows "Message"
  - No duplicate connection created
  - Toast shows: "Already connected to this user"

#### 9. Test Self-Connection Prevention
- [ ] As User A, try to connect with themselves
- [ ] Verify:
  - Button is hidden or disabled
  - API returns 400 error if attempted
  - Error message: "Cannot connect with yourself"

#### 10. Test Race Conditions
- [ ] As User A, rapidly click "Konnect" button multiple times
- [ ] Verify:
  - Button is disabled during first request
  - Only one connection request is created
  - No duplicate entries in database
  - No 500 errors

### Expected API Responses

#### POST /api/connections
- **201 Created**: New connection request created
- **200 OK**: Connection already pending (idempotent)
- **409 Conflict**: Already connected
- **400 Bad Request**: Invalid request (self-connection, invalid ID)
- **404 Not Found**: User not found
- **503 Service Unavailable**: Database connection error

#### POST /api/connections/respond
- **200 OK**: Connection accepted/rejected successfully
- **400 Bad Request**: Connection already processed
- **403 Forbidden**: Not the receiver
- **404 Not Found**: Connection not found

#### GET /api/conversations
- **200 OK**: Returns only conversations with ACCEPTED connections
- **401 Unauthorized**: Not logged in

#### POST /api/messages
- **201 Created**: Message sent successfully
- **403 Forbidden**: Not connected (connection not ACCEPTED)
- **404 Not Found**: Conversation not found

### Common Issues to Check

1. **500 Errors**: Check server logs for database errors
2. **Duplicate Connections**: Verify unique constraint is working
3. **Button States**: Ensure buttons reflect correct connection status
4. **Toast Messages**: Verify messages come from API, not hardcoded
5. **Notifications**: Check badge count updates correctly
6. **Messages Page**: Verify only accepted connections are shown

### Database Verification

Check the `Connection` table:
```sql
SELECT * FROM "Connection" WHERE "requesterId" = 'userA_id' OR "receiverId" = 'userA_id';
```

Verify:
- No duplicate entries
- Correct status (PENDING, ACCEPTED, REJECTED)
- Proper timestamps
- Unique constraint on (requesterId, receiverId) is enforced

