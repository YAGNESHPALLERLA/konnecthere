# Authentication Setup Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (`.env`):
   ```env
   # Database
   DATABASE_URL="postgresql://konnect:yagnesh0504@localhost:5432/konnecthere?schema=public"

   # Auth.js v5 (NextAuth v5)
   AUTH_SECRET="your-secret-here"
   AUTH_URL="http://localhost:3000"
   AUTH_TRUST_HOST=true

   # Legacy NextAuth v4 (for compatibility)
   NEXTAUTH_SECRET="same-as-AUTH_SECRET"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Set up database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Test login**:
   - Go to `http://localhost:3000/auth/signin`
   - Use test credentials (see below)

## Test Credentials

After running `npm run db:seed`, you can login with:

| Role  | Email                      | Password |
|-------|----------------------------|----------|
| ADMIN | `admin@konnecthere.com`    | `admin123` |
| HR    | `hr@konnecthere.com`       | `hr123` |
| USER  | `user@konnecthere.com`     | `user123` |

**⚠️ Important:** Change these passwords in production!

## Role-Based Access

### Routes

- **`/admin`** - ADMIN only
- **`/hr`** - HR only  
- **`/dashboard`** - All authenticated users (USER, HR, ADMIN)
- **`/messages`** - All authenticated users

### How It Works

1. **Middleware** (`middleware.ts`):
   - Matches only protected routes (`/admin`, `/hr`, `/dashboard`, `/messages`)
   - Does NOT call `auth()` to prevent redirect loops
   - Simply passes through - pages handle their own auth

2. **Page-Level Auth** (`lib/auth/roles.ts`):
   - Pages use `requireRole()` to check authentication
   - If not authenticated → redirects to `/auth/signin`
   - If wrong role → redirects to `/auth/signin?error=AccessDenied`

3. **Session Endpoint** (`/api/auth/session`):
   - Returns 200 with JSON (null if not authenticated)
   - Never redirects (middleware excludes `/api/auth/*`)

## Architecture

### Files

- **`auth.ts`** - Exports `auth`, `signIn`, `signOut` from NextAuth
- **`lib/auth.ts`** - NextAuth configuration (providers, callbacks)
- **`lib/auth/roles.ts`** - Authorization helpers (`requireRole`, `hasRole`, etc.)
- **`middleware.ts`** - Route protection (pass-through only)
- **`app/providers.tsx`** - SessionProvider wrapper
- **`app/api/auth/[...nextauth]/route.ts`** - NextAuth API handler

### Key Design Decisions

1. **No `auth()` in middleware**: Prevents redirect loops on `/api/auth/session`
2. **Page-level auth checks**: Each protected page calls `requireRole()`
3. **JWT strategy**: Uses JWT (not database sessions) for better performance
4. **Role in token**: User role is stored in JWT and session

## Troubleshooting

### "ERR_TOO_MANY_REDIRECTS" on `/api/auth/session`

**Cause:** Middleware is calling `auth()` which triggers `/api/auth/session` → redirect loop

**Fix:** Ensure middleware does NOT call `auth()`. It should only pass through protected routes.

### "Authentication Error" page with `error=undefined`

**Possible causes:**
1. Invalid credentials
2. User account is suspended (`status !== "ACTIVE"`)
3. Database connection issue
4. Missing environment variables

**Check:**
- Server logs for `[AUTH]` prefixed messages
- Database connection
- User exists and has correct password hash
- User `status` is `ACTIVE`

### Dashboard not loading

**Check:**
1. Session is valid: `curl http://localhost:3000/api/auth/session`
2. User has correct role in database
3. Page is calling `requireRole()` correctly
4. No console errors in browser

### Session returns `null` after login

**Possible causes:**
1. Cookie not being set (check browser DevTools → Application → Cookies)
2. `AUTH_SECRET` not set or incorrect
3. Domain mismatch (localhost vs 127.0.0.1)

**Fix:**
- Clear browser cookies
- Verify `AUTH_SECRET` is set
- Use `http://localhost:3000` consistently (not `127.0.0.1`)

## Development Tips

1. **Clear cookies** when testing auth changes
2. **Check server logs** for `[AUTH]` prefixed messages
3. **Use Incognito mode** to test fresh sessions
4. **Verify session endpoint** returns 200 (not redirect):
   ```bash
   curl http://localhost:3000/api/auth/session
   ```

## Production Checklist

- [ ] Change default passwords
- [ ] Set strong `AUTH_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Update `AUTH_URL` to production domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Review rate limiting
- [ ] Set up proper error logging
- [ ] Test all role-based routes

## Additional Resources

- [NextAuth.js v5 Docs](https://authjs.dev/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Prisma Auth Adapter](https://authjs.dev/reference/adapter/prisma)



