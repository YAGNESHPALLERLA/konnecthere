# Environment Variables Setup Guide

## Quick Setup

To fix the NextAuth error, you need to create a `.env` file with the following **minimum required** variables:

### 1. Create `.env` file

```bash
cp .env.example .env
```

### 2. Minimum Required Variables (to get started)

Add these to your `.env` file:

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/konnecthere?schema=public"

# NextAuth (REQUIRED - Generate a new secret)
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET_HERE"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"

# AWS S3 (REQUIRED for resume uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="konnecthere-resumes"
```

### 3. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `NEXTAUTH_SECRET` in your `.env` file.

### 4. Optional Variables (can be added later)

These are optional and the app will work without them:

```bash
# OAuth Providers (Optional - for LinkedIn/Google login)
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email/SMTP (Optional - for email authentication)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD=""
SMTP_FROM="noreply@konnecthere.com"

# Algolia Search (Optional - for advanced search)
ALGOLIA_APP_ID=""
ALGOLIA_API_KEY=""
ALGOLIA_INDEX_NAME="jobs"

# Resume Parser (Optional)
RESUME_PARSER_URL="http://localhost:8001"
```

## What You Need to Provide

### Essential (Must Have):
1. **PostgreSQL Database** - Either:
   - Local PostgreSQL installation
   - Supabase free tier (recommended for quick start)
   - Any PostgreSQL database URL

2. **NEXTAUTH_SECRET** - Generate using: `openssl rand -base64 32`

3. **AWS S3 Credentials** - For resume file uploads:
   - AWS Access Key ID
   - AWS Secret Access Key
   - S3 Bucket Name
   - AWS Region

### Optional (Can Add Later):
- LinkedIn OAuth credentials (for LinkedIn login)
- Google OAuth credentials (for Google login)
- SMTP credentials (for email authentication)
- Algolia credentials (for advanced search features)

## Quick Start Options

### Option 1: Minimal Setup (Just to get it running)
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/konnecthere"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
```

### Option 2: Full Setup (All features)
Copy all variables from `.env.example` and fill them in.

## After Setting Up .env

1. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

2. Run Database Migrations:
   ```bash
   npm run db:migrate
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

The NextAuth error should be resolved once you have the `.env` file with at least `DATABASE_URL` and `NEXTAUTH_SECRET` set.







