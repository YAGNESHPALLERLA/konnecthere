# Complete Environment Variables List

## 📋 All Required Environment Variables

### 🔴 **CRITICAL - Must Have (App won't work without these)**

#### 1. Database Configuration
```bash
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```
**What you need:**
- PostgreSQL database (local or cloud)
- Connection string format: `postgresql://user:pass@host:port/dbname?schema=public`
- **Options:**
  - Local: `postgresql://postgres:password@localhost:5432/konnecthere?schema=public`
  - Supabase: Get from Supabase dashboard → Settings → Database
  - Railway/Neon: Get from their dashboard

#### 2. NextAuth Authentication
```bash
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
```
**What you need:**
- Generate secret: Run `openssl rand -base64 32` and copy the output
- For production: Change URLs to your domain (e.g., `https://yourdomain.com`)

---

### 🟡 **IMPORTANT - Required for Core Features**

#### 3. AWS S3 (For Resume Uploads)
```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET_NAME="konnecthere-resumes"
AWS_S3_CDN_URL="https://cdn.yourdomain.com"  # Optional - for CDN
```
**What you need:**
- AWS Account
- Create S3 bucket
- Create IAM user with S3 permissions
- Get Access Key ID and Secret Access Key from IAM
- **Without this:** Resume upload feature won't work

---

### 🟢 **OPTIONAL - For Additional Features**

#### 4. OAuth Providers (For Social Login)

**LinkedIn OAuth:**
```bash
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_ORGANIZATION_ID="your-org-id"  # Optional - for company page posts
```
**What you need:**
- LinkedIn Developer Account
- Create app at https://www.linkedin.com/developers/apps
- Get Client ID and Client Secret
- Add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
- **Without this:** LinkedIn login won't work (email/password still works)

**Google OAuth:**
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
**What you need:**
- Google Cloud Console account
- Create OAuth 2.0 credentials
- Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
- **Without this:** Google login won't work (email/password still works)

#### 5. Email/SMTP (For Email Authentication)
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@konnecthere.com"
```
**What you need:**
- Email service provider (SendGrid, Mailgun, AWS SES, etc.)
- API key or SMTP credentials
- **Without this:** Email-based authentication won't work (OAuth/password still works)

**Popular Options:**
- **SendGrid:** Free tier (100 emails/day)
- **Mailgun:** Free tier (5,000 emails/month)
- **AWS SES:** Very cheap, pay per email

#### 6. Algolia Search (For Advanced Search)
```bash
ALGOLIA_APP_ID="your-algolia-app-id"
ALGOLIA_API_KEY="your-algolia-api-key"
ALGOLIA_INDEX_NAME="jobs"
```
**What you need:**
- Algolia account (free tier available)
- Create application
- Get App ID and API Key
- **Without this:** Search falls back to PostgreSQL full-text search (still works)

#### 7. Resume Parser Service
```bash
RESUME_PARSER_URL="http://localhost:8001"
```
**What you need:**
- Resume parser microservice running
- Default: `http://localhost:8001`
- **Without this:** Automatic resume parsing won't work (manual upload still works)

---

## 📝 Complete .env File Template

```bash
# ============================================
# CRITICAL - Must Have
# ============================================

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/konnecthere?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"

# ============================================
# IMPORTANT - For Resume Uploads
# ============================================

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="konnecthere-resumes"
AWS_S3_CDN_URL=""  # Optional

# ============================================
# OPTIONAL - OAuth Providers
# ============================================

# LinkedIn
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
LINKEDIN_ORGANIZATION_ID=""  # Optional

# Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ============================================
# OPTIONAL - Email/SMTP
# ============================================

SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD=""
SMTP_FROM="noreply@konnecthere.com"

# ============================================
# OPTIONAL - Search
# ============================================

ALGOLIA_APP_ID=""
ALGOLIA_API_KEY=""
ALGOLIA_INDEX_NAME="jobs"

# ============================================
# OPTIONAL - Resume Parser
# ============================================

RESUME_PARSER_URL="http://localhost:8001"

# ============================================
# OPTIONAL - Analytics/Monitoring
# ============================================

SENTRY_DSN=""
NEXT_PUBLIC_GA_ID=""
```

---

## 🚀 Quick Setup Guide

### Step 1: Minimum Setup (Just to get it running)

```bash
# Create .env file
cp .env.example .env

# Generate NextAuth secret
openssl rand -base64 32

# Edit .env and add:
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="paste-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
```

### Step 2: Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
sudo apt-get install postgresql  # Ubuntu/Debian
brew install postgresql          # macOS

# Create database
createdb konnecthere

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/konnecthere?schema=public"
```

**Option B: Supabase (Free Tier - Recommended)**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Paste as `DATABASE_URL` in `.env`

**Option C: Railway/Neon (Free Tier)**
1. Create account at railway.app or neon.tech
2. Create PostgreSQL database
3. Copy connection string
4. Paste as `DATABASE_URL` in `.env`

### Step 3: Generate Prisma Client & Run Migrations

```bash
npm run db:generate
npm run db:migrate
```

### Step 4: Start Development Server

```bash
npm run dev
```

---

## 📊 Feature Dependency Matrix

| Feature | Required Variables | Works Without? |
|---------|-------------------|----------------|
| **Basic App** | `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_URL` | ❌ No |
| **Resume Upload** | `AWS_*` variables | ✅ Yes (but feature disabled) |
| **LinkedIn Login** | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | ✅ Yes (email/password works) |
| **Google Login** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | ✅ Yes (email/password works) |
| **Email Auth** | `SMTP_*` variables | ✅ Yes (OAuth/password works) |
| **Advanced Search** | `ALGOLIA_*` variables | ✅ Yes (PostgreSQL search works) |
| **Resume Parsing** | `RESUME_PARSER_URL` | ✅ Yes (manual entry works) |

---

## 🔐 Security Notes

1. **Never commit `.env` file** to git
2. **Generate strong secrets** using `openssl rand -base64 32`
3. **Use different secrets** for development and production
4. **Rotate secrets** periodically in production
5. **Use environment variables** in production (Vercel, Railway, etc.)

---

## ✅ Checklist

- [ ] Created `.env` file
- [ ] Added `DATABASE_URL` (PostgreSQL connection)
- [ ] Generated and added `NEXTAUTH_SECRET`
- [ ] Added `NEXTAUTH_URL` and `AUTH_URL`
- [ ] (Optional) Added AWS S3 credentials for resume uploads
- [ ] (Optional) Added OAuth credentials for social login
- [ ] (Optional) Added SMTP credentials for email auth
- [ ] (Optional) Added Algolia credentials for search
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:migrate`
- [ ] Started dev server with `npm run dev`

---

## 🆘 Need Help?

If you're missing any of these, the app will still run but certain features will be disabled. The minimum required are:
1. Database connection
2. NextAuth secret
3. NextAuth URLs

Everything else is optional and can be added later!







