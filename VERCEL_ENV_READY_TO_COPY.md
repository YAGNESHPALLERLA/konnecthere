# ✅ Vercel Environment Variables - Ready to Copy

## 🔐 Generated NEXTAUTH_SECRET

I've generated a secure secret for you. Use this value:

```
yG3msEQsx8khG8ny6B96lckkYzznYJA26a+plQJRXM0=
```

---

## 📋 Copy These to Vercel

Go to Vercel → Your Project → Settings → Environment Variables

Add each variable one by one:

### 1. Database (YOU MUST PROVIDE THIS)

**Key:** `DATABASE_URL`  
**Value:** `YOUR_PRODUCTION_DATABASE_URL_HERE`

**How to get:**
- **Supabase (Free):** https://supabase.com → Create Project → Settings → Database → Copy connection string
- **Railway (Free):** https://railway.app → New Project → Add PostgreSQL → Copy connection string  
- **Neon (Free):** https://neon.tech → Create Project → Copy connection string

**Format:** `postgresql://user:password@host:port/database?schema=public`

---

### 2. NextAuth Secret (✅ GENERATED FOR YOU)

**Key:** `NEXTAUTH_SECRET`  
**Value:** `yG3msEQsx8khG8ny6B96lckkYzznYJA26a+plQJRXM0=`

---

### 3. NextAuth URLs

**Key:** `NEXTAUTH_URL`  
**Value:** `https://konnecthere.com`

**Key:** `AUTH_URL`  
**Value:** `https://konnecthere.com`

**Key:** `AUTH_TRUST_HOST`  
**Value:** `true`

---

### 4. AWS Region

**Key:** `AWS_REGION`  
**Value:** `us-east-1`

---

### 5. AWS Access Key ID (YOU MUST PROVIDE THIS)

**Key:** `AWS_ACCESS_KEY_ID`  
**Value:** `YOUR_AWS_ACCESS_KEY_ID_HERE`

**How to get:**
1. Go to https://aws.amazon.com and sign in
2. Go to IAM → Users → Create user
3. Name: `konnecthere-s3-user`
4. Select "Programmatic access"
5. Attach policy: `AmazonS3FullAccess`
6. Create user
7. **Copy the Access Key ID** (you won't see it again!)

---

### 6. AWS Secret Access Key (YOU MUST PROVIDE THIS)

**Key:** `AWS_SECRET_ACCESS_KEY`  
**Value:** `YOUR_AWS_SECRET_ACCESS_KEY_HERE`

**How to get:**
- Same as above - when you create the IAM user, **copy the Secret Access Key** immediately
- If you lost it, delete the user and create a new one

---

### 7. S3 Bucket Name

**Key:** `AWS_S3_BUCKET_NAME`  
**Value:** `konnecthere-resumes`

**How to create bucket:**
1. Go to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `konnecthere-resumes`
4. Region: `us-east-1`
5. Uncheck "Block all public access" (or configure CORS)
6. Create bucket

---

## 📝 Quick Copy-Paste Format

For easy copying, here's the format Vercel uses:

```
DATABASE_URL=YOUR_PRODUCTION_DATABASE_URL_HERE
NEXTAUTH_SECRET=yG3msEQsx8khG8ny6B96lckkYzznYJA26a+plQJRXM0=
NEXTAUTH_URL=https://konnecthere.com
AUTH_URL=https://konnecthere.com
AUTH_TRUST_HOST=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY_HERE
AWS_S3_BUCKET_NAME=konnecthere-resumes
```

---

## ⚠️ What You Need to Provide

You need to get these 3 values:

1. ✅ **DATABASE_URL** - Set up a PostgreSQL database (Supabase/Railway/Neon)
2. ✅ **AWS_ACCESS_KEY_ID** - Create AWS IAM user and get access key
3. ✅ **AWS_SECRET_ACCESS_KEY** - Get secret key from same IAM user

Everything else is already filled in for you!

---

## 🚀 After Adding Variables

1. **Redeploy** your Vercel project
2. **Run database migrations:**
   ```bash
   export DATABASE_URL="your-production-database-url"
   npx prisma migrate deploy
   ```
3. **Test** at https://konnecthere.com

---

## 📚 Detailed Instructions

See `VERCEL_ENV_VARIABLES.md` for step-by-step guides on:
- Setting up Supabase database
- Creating AWS S3 bucket
- Creating AWS IAM user
- And more!

