# Authentication Setup - KonnectHere

## Auth.js Version
- **NextAuth v5 (beta.30)** - Using `next-auth` package
- Uses `@auth/prisma-adapter` for database integration

## Environment Variables Required

### Required Variables
```env
# Auth Secret (required for JWT signing)
AUTH_SECRET="your-secret-here"  # or NEXTAUTH_SECRET (both work)
NEXTAUTH_SECRET="your-secret-here"  # Legacy name, still supported

# Auth URLs
NEXTAUTH_URL="http://localhost:3000"  # For development
AUTH_URL="http://localhost:3000"  # For NextAuth v5

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

### Optional OAuth Providers
```env
# LinkedIn (optional - only if you want LinkedIn login)
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# Google (optional - only if you want Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Note:** OAuth providers are only added if credentials are provided. If not set, only email/password (Credentials) login will be available.

## Auth Route Handlers

### Location
- **Route Handler**: `app/api/auth/[...nextauth]/route.ts`
- **Auth Config**: `lib/auth.ts`
- **Auth Export**: `auth.ts` (exports handlers, auth, signIn, signOut)

### Route Path
- Default: `/api/auth/*`
- Sign in: `/api/auth/signin`
- Sign out: `/api/auth/signout`
- Session: `/api/auth/session`
- Callback: `/api/auth/callback/[provider]`

## Role-Based Authentication

### User Roles
The system supports three roles:
- **ADMIN** - Full system access
- **HR** - Can manage jobs and applications
- **USER** - Can apply for jobs and manage profile

### Role Storage
- Roles are stored in the `User` model in Prisma (`role` field)
- Roles are included in JWT token and session
- Legacy roles (CANDIDATE, EMPLOYER) are automatically mapped:
  - `CANDIDATE` → `USER`
  - `EMPLOYER` → `HR`

### Role Access
- **ADMIN**: Can access `/admin` dashboard
- **HR**: Can access `/hr` dashboard
- **USER**: Can access `/dashboard` (user dashboard)

### Session Structure
```typescript
{
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
    role: "USER" | "HR" | "ADMIN"
  }
}
```

## Test Users

After running `npm run db:seed`, you can login with:

1. **Admin User**
   - Email: `admin@konnecthere.com`
   - Password: `admin123`
   - Role: ADMIN

2. **HR User**
   - Email: `hr@konnecthere.com`
   - Password: `hr123`
   - Role: HR

3. **Regular User**
   - Email: `user@konnecthere.com`
   - Password: `user123`
   - Role: USER

## Authentication Flow

### Credentials Login
1. User submits email/password on `/auth/signin`
2. `CredentialsProvider` validates credentials against database
3. Password is verified using bcrypt
4. User role is fetched and included in JWT token
5. Session is created and user is redirected to appropriate dashboard

### OAuth Login (if configured)
1. User clicks OAuth provider button
2. Redirected to provider's authorization page
3. After authorization, callback creates/updates user in database
4. Session is created with default role "USER" (can be updated later)
5. User is redirected to dashboard

## Error Handling

### Error Page
- Location: `/auth/error`
- Displays user-friendly error messages based on error type
- Common errors:
  - `CredentialsSignin` - Invalid email/password
  - `AccessDenied` - User account is suspended or access denied
  - `Configuration` - Server configuration issue
  - `OAuthAccountNotLinked` - Email already exists with different provider

### Error Logging
- All auth errors are logged to console in development mode
- Production errors are handled gracefully without exposing details

## Middleware Protection

### Protected Routes
- `/admin` - ADMIN only
- `/hr` - HR only
- `/dashboard` - All authenticated users
- `/messages` - All authenticated users

### Middleware Behavior
- Unauthenticated users are redirected to `/auth/signin`
- Authenticated users on auth pages are redirected to home (which redirects to dashboard)
- Role-based access is enforced at middleware level

## Database Schema

### Required Models (from Prisma)
- `User` - User accounts with role and status
- `Account` - OAuth account links
- `Session` - Active sessions (if using database sessions)
- `VerificationToken` - Email verification tokens

### User Model Fields
```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  password      String?       // Hashed password
  role          UserRole      @default(USER)
  status        UserStatus    @default(ACTIVE)
  // ... other fields
}
```

## Troubleshooting

### "ClientFetchError: Failed to fetch"
- Check that `AUTH_SECRET` or `NEXTAUTH_SECRET` is set
- Verify database connection is working
- Check that `/api/auth/*` routes are not blocked by middleware
- Ensure `NEXTAUTH_URL` matches your actual URL

### "error=undefined" on error page
- This usually means an unhandled error occurred
- Check server logs for detailed error messages
- Verify all required environment variables are set
- Ensure Prisma client is generated (`npm run db:generate`)

### Login not working
- Verify user exists in database with `status: "ACTIVE"`
- Check password is correctly hashed (use seed script to create test users)
- Verify credentials provider is enabled (it's always enabled)
- Check browser console and server logs for specific errors

### Role not appearing in session
- Verify role is set in database
- Check JWT callback is correctly mapping role
- Ensure session callback includes role in session object
- Clear browser cookies and try again

## Commands

```bash
# Generate Prisma client
npm run db:generate

# Seed database with test users
npm run db:seed

# Run migrations (if schema changed)
npm run db:migrate

# Push schema changes (development)
npm run db:push
```

## Security Notes

1. **Secrets**: Never commit `AUTH_SECRET` to version control
2. **Passwords**: All passwords are hashed using bcrypt (10 rounds)
3. **JWT**: Sessions use JWT strategy (no database session storage by default)
4. **HTTPS**: Use HTTPS in production (set `NEXTAUTH_URL` to https://)
5. **CORS**: Configure CORS properly for production domains




