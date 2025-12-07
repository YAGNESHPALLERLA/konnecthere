# Environment Variables Setup Guide

This document explains all required and optional environment variables for KonnectHere.

## Required Variables

### Database
```bash
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```
- **Local**: `postgresql://konnect:password@localhost:5432/konnecthere?schema=public`
- **Production**: Your production database connection string (e.g., Supabase, Railway, etc.)

### Authentication Secrets
```bash
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"
NEXTAUTH_SECRET="your-generated-secret-here"  # Same as AUTH_SECRET for compatibility
```
- `AUTH_SECRET` is the primary secret for Auth.js v5 (NextAuth v5)
- `NEXTAUTH_SECRET` is supported for backward compatibility
- **Both should be set to the same value**
- Generate a new secret: `openssl rand -base64 32`

### Authentication URLs
```bash
# Local development
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Production
AUTH_URL="https://konnecthere.com"
NEXTAUTH_URL="https://konnecthere.com"
```
- Both `AUTH_URL` and `NEXTAUTH_URL` should be set to the same value
- **Local**: `http://localhost:3000` (or your dev server port)
- **Production**: `https://konnecthere.com` (or your custom domain)

## Optional Variables

### OAuth Providers

#### LinkedIn
```bash
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_ORGANIZATION_ID="your-org-id"  # Optional, for company page posts
```

#### Google
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### AWS S3 (for resume uploads)
```bash
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

### Algolia (for search)
```bash
ALGOLIA_APP_ID="your-algolia-app-id"
ALGOLIA_API_KEY="your-algolia-api-key"
ALGOLIA_INDEX_NAME="jobs"
```

### Email/SMTP (for notifications)
```bash
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="noreply@konnecthere.com"
```

### Debug Mode
```bash
ALLOW_DEBUG="false"  # Set to "true" only in development
```
- When `true`, enables debug endpoints: `/api/debug/env`, `/api/debug/users`, `/api/debug/auth`
- **Never set to `true` in production**

## Example .env File

```bash
# Database
DATABASE_URL="postgresql://konnect:password@localhost:5432/konnecthere?schema=public"

# Authentication
AUTH_SECRET="generated-secret-here"
NEXTAUTH_SECRET="generated-secret-here"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME=""

# Debug (Optional - development only)
ALLOW_DEBUG="false"
```

## Vercel Environment Variables

When deploying to Vercel, set these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

1. **DATABASE_URL** - Your production database connection string
2. **AUTH_SECRET** - Same secret as local (or generate new one)
3. **NEXTAUTH_SECRET** - Same as AUTH_SECRET
4. **AUTH_URL** - `https://konnecthere.com` (your production domain)
5. **NEXTAUTH_URL** - `https://konnecthere.com` (same as AUTH_URL)
6. Any optional variables you need (OAuth, AWS, etc.)

**Important**: 
- Set these for **Production**, **Preview**, and **Development** environments
- After setting variables, redeploy your application

