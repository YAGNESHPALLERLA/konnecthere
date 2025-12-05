# 📋 What You Need to Provide - Simple Checklist

## ✅ REQUIRED ITEMS (Must Provide)

### 1. PostgreSQL Database Connection
- [ ] **Database URL** (connection string)
  - Format: `postgresql://username:password@host:port/database?schema=public`
  - **Where to get it:**
    - **Local:** Install PostgreSQL, create database, use: `postgresql://postgres:password@localhost:5432/konnecthere?schema=public`
    - **Supabase (Free):** https://supabase.com → Create project → Settings → Database → Copy connection string
    - **Railway (Free):** https://railway.app → Create PostgreSQL → Copy connection string
    - **Neon (Free):** https://neon.tech → Create project → Copy connection string

### 2. NextAuth Secret
- [ ] **Secret Key** (for authentication security)
  - **How to generate:** Run this command: `openssl rand -base64 32`
  - Copy the output and save it

### 3. App URLs
- [ ] **NEXTAUTH_URL** = `http://localhost:3000` (for development)
- [ ] **AUTH_URL** = `http://localhost:3000` (for development)

---

## ⚠️ IMPORTANT ITEMS (For Resume Upload Feature)

### 4. AWS S3 Credentials
- [ ] **AWS Access Key ID**
- [ ] **AWS Secret Access Key**
- [ ] **AWS Region** (e.g., `us-east-1`)
- [ ] **S3 Bucket Name** (e.g., `konnecthere-resumes`)
  - **How to get:**
    1. Create AWS account
    2. Go to IAM → Create user with S3 permissions
    3. Create Access Key → Copy Access Key ID and Secret
    4. Go to S3 → Create bucket → Note the bucket name

---

## 🔵 OPTIONAL ITEMS (Can Add Later)

### 5. LinkedIn OAuth (For LinkedIn Login)
- [ ] **LinkedIn Client ID**
- [ ] **LinkedIn Client Secret**
  - **How to get:**
    1. Go to https://www.linkedin.com/developers/apps
    2. Create app
    3. Get Client ID and Client Secret
    4. Add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`

### 6. Google OAuth (For Google Login)
- [ ] **Google Client ID**
- [ ] **Google Client Secret**
  - **How to get:**
    1. Go to https://console.cloud.google.com
    2. Create OAuth 2.0 credentials
    3. Add redirect: `http://localhost:3000/api/auth/callback/google`

### 7. Email/SMTP (For Email Authentication)
- [ ] **SMTP Host** (e.g., `smtp.sendgrid.net`)
- [ ] **SMTP Port** (e.g., `587`)
- [ ] **SMTP User** (e.g., `apikey`)
- [ ] **SMTP Password** (API key)
  - **Free options:**
    - SendGrid: https://sendgrid.com (100 emails/day free)
    - Mailgun: https://mailgun.com (5,000 emails/month free)

### 8. Algolia Search (For Advanced Search)
- [ ] **Algolia App ID**
- [ ] **Algolia API Key**
- [ ] **Algolia Index Name** (e.g., `jobs`)
  - **How to get:**
    1. Go to https://www.algolia.com
    2. Create account (free tier available)
    3. Create app → Get App ID and API Key

### 9. Resume Parser Service
- [ ] **Resume Parser URL** (e.g., `http://localhost:8001`)
  - Only needed if you're running the resume parser microservice

---

## 📝 Quick Setup Steps

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate NextAuth secret:**
   ```bash
   openssl rand -base64 32
   ```

3. **Edit `.env` file and add:**
   ```bash
   # REQUIRED
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_SECRET="paste-generated-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   AUTH_URL="http://localhost:3000"
   
   # IMPORTANT (for resume uploads)
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-key"
   AWS_SECRET_ACCESS_KEY="your-secret"
   AWS_S3_BUCKET_NAME="konnecthere-resumes"
   
   # OPTIONAL (add later if needed)
   # ... other variables
   ```

4. **Run setup commands:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run dev
   ```

---

## 🎯 Minimum to Get Started

**You only need these 4 items to get the app running:**
1. ✅ PostgreSQL database connection string
2. ✅ NextAuth secret (generate with `openssl rand -base64 32`)
3. ✅ NEXTAUTH_URL = `http://localhost:3000`
4. ✅ AUTH_URL = `http://localhost:3000`

**Everything else is optional and can be added later!**

---

## 💡 Recommended Order

1. **Start with minimum** (database + NextAuth secret) → Get app running
2. **Add AWS S3** → Enable resume uploads
3. **Add OAuth providers** → Enable social login
4. **Add other features** → As needed






