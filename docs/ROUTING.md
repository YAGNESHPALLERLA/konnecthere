# Routing & Navigation Guide

This document describes the routing structure, navigation patterns, and how to debug routing issues in KonnectHere.

## Route Structure

### Public Routes

- `/` - Home page
- `/jobs` - Browse all jobs
- `/jobs/[slug]` - Job detail page
- `/jobs/[slug]/apply` - Apply to a job (requires authentication)
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/error` - Authentication error page
- `/about` - About page
- `/careers` - Careers page
- `/press` - Press & media page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/security` - Security information
- `/contact` - Contact page
- `/support` - Support & FAQ page
- `/status` - System status page

### Protected Routes (Require Authentication)

#### Dashboard Routes

- `/dashboard` - Redirects to role-specific dashboard
  - ADMIN → `/dashboard/admin`
  - HR → `/dashboard/hr`
  - USER → `/dashboard/user`

- `/dashboard/admin` - Admin dashboard (ADMIN only)
- `/dashboard/hr` - HR dashboard (HR only)
- `/dashboard/user` - User dashboard (USER only)
- `/dashboard/profile` - Edit user profile
- `/dashboard/applications` - View all applications (USER)
- `/dashboard/saved` - Redirects to `/candidate/saved`
- `/dashboard/resumes` - Manage resumes

#### HR Routes

- `/hr` - HR dashboard (same as `/dashboard/hr`)
- `/hr/applications` - View all applications for HR-managed companies
- `/hr/applications/[id]` - Review individual application
- `/hr/jobs` - Manage jobs (if exists)
- `/hr/jobs/new` - Post new job
- `/hr/jobs/[id]` - Manage specific job

#### Candidate/User Routes

- `/candidate/dashboard` - Candidate dashboard (same as `/dashboard/user`)
- `/candidate/saved` - Saved jobs
- `/candidate/alerts` - Job alerts

#### Employer Routes

- `/employer/dashboard` - Employer dashboard
- `/employer/jobs` - Manage jobs
- `/employer/jobs/new` - Post new job
- `/employer/jobs/[id]` - Manage specific job
- `/employer/companies/new` - Create company profile
- `/employer/onboarding` - Employer onboarding

#### Messaging

- `/messages` - Messages page
  - Query params:
    - `id` - Conversation ID
    - `userId` - Target user ID (creates/finds conversation)
    - `jobId` - Job ID (finds job owner and creates conversation)
    - `applicationId` - Application ID (finds applicant and creates conversation)

## Role-Based Access Control

### Authentication Flow

1. User signs in at `/auth/signin`
2. After successful login, user is redirected based on role:
   - ADMIN → `/dashboard/admin`
   - HR → `/dashboard/hr`
   - USER → `/dashboard/user`
3. If a `callbackUrl` is provided and valid, user is redirected there instead

### Access Control

Routes are protected using the `requireRole()` function from `@/lib/auth/roles`:

```typescript
import { requireRole } from "@/lib/auth/roles"

export default async function ProtectedPage() {
  // This will redirect to /auth/signin if not authenticated
  // Or redirect to user's own dashboard if wrong role
  const user = await requireRole("ADMIN")
  // ... rest of page
}
```

### Role Permissions

- **ADMIN**: Full access to all routes, can manage users, jobs, and applications
- **HR**: Can manage companies assigned to them, post jobs, review applications
- **USER**: Can browse jobs, apply, manage their own applications and profile

## Navigation Components

### Navbar

The main navigation bar (`components/Navbar.tsx`) shows different links based on user role:

- **Unauthenticated**: Jobs, Sign In, Join
- **ADMIN**: Jobs, Admin, Messages
- **HR**: Jobs, HR Dashboard, Messages
- **USER**: Jobs, Dashboard, Messages

### Footer

The footer (`components/Footer.tsx`) contains links to:
- Overview: About, Careers, Press
- Candidates: Browse roles, Create profile, Saved jobs
- Employers: Post a role, Dashboard, Company profiles
- Legal: Privacy, Terms, Security

## Messaging System

### Creating Conversations

Conversations are created automatically when:
1. User clicks "Message" button with a `userId` parameter
2. User clicks "Message" from a job application (uses `applicationId`)
3. User clicks "Message" from a job posting (uses `jobId` to find owner)

### Message Flow

1. User navigates to `/messages?userId=xxx` (or `jobId`, `applicationId`)
2. Frontend checks if conversation exists
3. If not, creates conversation via `/api/conversations` POST
4. Redirects to `/messages?id=conversationId`
5. Messages are fetched and displayed
6. New messages poll every 3 seconds

## Error Handling

### 404 Page

- Route: `app/not-found.tsx`
- Shown when a route doesn't exist
- Provides links to go home or browse jobs

### Error Page

- Route: `app/error.tsx`
- Shown when an unhandled error occurs
- Provides "Try Again" button and link to home

### Authentication Errors

- Route: `app/auth/error/page.tsx`
- Shown when authentication fails
- Displays specific error messages

## Debugging Routing Issues

### Common Issues

1. **Redirect Loops**
   - Check `lib/auth.ts` redirect callback
   - Ensure middleware/proxy doesn't intercept `/auth/*` routes
   - Verify `NEXTAUTH_URL` and `AUTH_URL` are set correctly

2. **404 on Protected Routes**
   - Verify user is authenticated
   - Check `requireRole()` is used correctly
   - Ensure route file exists in `app/` directory

3. **Wrong Dashboard After Login**
   - Check `app/auth/signin/page.tsx` redirect logic
   - Verify user role in database matches session
   - Check `lib/auth.ts` JWT and session callbacks

4. **Messages Not Loading**
   - Verify user is authenticated
   - Check conversation exists in database
   - Verify API routes return correct data
   - Check browser console for errors

### Debug Endpoints

When `ALLOW_DEBUG=true` is set:

- `/api/debug/auth` - Check auth configuration and session
- `/api/debug/env` - Check environment variables (without exposing secrets)
- `/api/debug/users` - List users in database

### Testing Routes

1. **Test Authentication Flow**
   ```bash
   # Sign in as different roles
   # Verify redirects to correct dashboard
   ```

2. **Test Protected Routes**
   ```bash
   # Try accessing /dashboard/admin as USER
   # Should redirect to /dashboard/user
   ```

3. **Test Messaging**
   ```bash
   # Create conversation via /messages?userId=xxx
   # Verify conversation appears in list
   # Send message and verify it appears
   ```

## Key Files

- `app/layout.tsx` - Root layout with Navbar and Footer
- `app/dashboard/page.tsx` - Dashboard redirect logic
- `lib/auth/roles.ts` - Role-based access control utilities
- `lib/auth.ts` - Auth.js configuration
- `components/Navbar.tsx` - Main navigation
- `components/Footer.tsx` - Footer navigation

## Best Practices

1. **Always use `requireRole()` for protected routes**
2. **Use server components for data fetching**
3. **Handle loading and error states**
4. **Use proper TypeScript types for route params**
5. **Test redirects after authentication changes**
6. **Keep navigation consistent across pages**

