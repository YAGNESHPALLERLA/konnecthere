# Vercel Environment Variables - Complete Setup

## 🔐 Generated Values

I've generated a secure `NEXTAUTH_SECRET` for you. Copy the values below to Vercel.

---

## ✅ Required Environment Variables

Copy and paste these into Vercel → Settings → Environment Variables:

### 1. Database Configuration

```bash
DATABASE_URL=YOUR_PRODUCTION_DATABASE_URL_HERE
```

**⚠️ YOU NEED TO PROVIDE THIS:**
- Set up a PostgreSQL database (Supabase, Railway, Neon, or any PostgreSQL provider)
- Get the connection string
- Format: `postgresql://user:password@host:port/database?schema=public`

**Quick Setup Options:**
- **Supabase (Free):** https://supabase.com → Create Project → Settings → Database → Copy connection string
- **Railway (Free):** https://railway.app → New Project → Add PostgreSQL → Copy connection string
- **Neon (Free):** https://neon.tech → Create Project → Copy connection string

---

### 2. NextAuth Configuration

```bash
NEXTAUTH_SECRET=GENERATED_SECRET_BELOW
NEXTAUTH_URL=https://konnecthere.com
AUTH_URL=https://konnecthere.com
AUTH_TRUST_HOST=true
```

**✅ NEXTAUTH_SECRET (Generated for you):**
See the generated value below ⬇️

---

### 3. AWS S3 Configuration (For Resume Uploads)

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME=konnecthere-resumes
```

**⚠️ YOU NEED TO PROVIDE THESE:**

**Step 1: Create AWS Account**
- Go to https://aws.amazon.com
- Sign up for AWS account (free tier available)

**Step 2: Create S3 Bucket**
1. Go to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `konnecthere-resumes` (or your preferred name)
4. Region: `us-east-1` (or your preferred region)
5. Uncheck "Block all public access" (or configure CORS if needed)
6. Click "Create bucket"

**Step 3: Create IAM User for S3 Access**
1. Go to AWS Console → IAM → Users
2. Click "Add users"
3. Username: `konnecthere-s3-user`
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search and select: `AmazonS3FullAccess` (or create custom policy with only S3 permissions)
8. Click "Next" → "Next" → "Create user"
9. **IMPORTANT:** Copy the "Access key ID" and "Secret access key" immediately (you won't see it again!)

**Step 4: Update Environment Variables**
- `AWS_ACCESS_KEY_ID` = The Access key ID you copied
- `AWS_SECRET_ACCESS_KEY` = The Secret access key you copied
- `AWS_S3_BUCKET_NAME` = The bucket name you created (e.g., `konnecthere-resumes`)
- `AWS_REGION` = The region where you created the bucket (e.g., `us-east-1`)

---

## 📋 Complete Environment Variables List

Copy this entire list and fill in the values marked with `YOUR_*`:

```bash
# ============================================
# CRITICAL - Must Have
# ============================================

# Database (REQUIRED - You must provide this)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# NextAuth (REQUIRED - Secret generated below)
NEXTAUTH_SECRET=PASTE_GENERATED_SECRET_BELOW
NEXTAUTH_URL=https://konnecthere.com
AUTH_URL=https://konnecthere.com
AUTH_TRUST_HOST=true

# ============================================
# AWS S3 - For Resume Uploads
# ============================================

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME=konnecthere-resumes

# ============================================
# OPTIONAL - Can add later
# ============================================

# LinkedIn OAuth (Optional)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email/SMTP (Optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=
SMTP_FROM=noreply@konnecthere.com

# Algolia Search (Optional)
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=
ALGOLIA_INDEX_NAME=jobs

# Resume Parser (Optional)
RESUME_PARSER_URL=
```

---

## 🚀 How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. For each variable:
   - Click **"Add New"**
   - Enter the **Key** (e.g., `DATABASE_URL`)
   - Enter the **Value** (paste your value)
   - Select environments: ✅ **Production**, ✅ **Preview**, ✅ **Development**
   - Click **"Save"**
4. Repeat for all variables

---

## ⚠️ Important Notes

1. **Never commit these values to Git** - They're already in `.gitignore`
2. **Use different secrets for production** - Don't reuse development secrets
3. **Keep AWS credentials secure** - Don't share them publicly
4. **Test after adding** - Deploy and test the application

---

## ✅ Checklist

Before deploying, make sure you have:

- [ ] `DATABASE_URL` - Production PostgreSQL database connection string
- [ ] `NEXTAUTH_SECRET` - Generated secret (see below)
- [ ] `NEXTAUTH_URL` - Set to `https://konnecthere.com`
- [ ] `AUTH_URL` - Set to `https://konnecthere.com`
- [ ] `AUTH_TRUST_HOST` - Set to `true`
- [ ] `AWS_REGION` - Set to your AWS region (e.g., `us-east-1`)
- [ ] `AWS_ACCESS_KEY_ID` - Your AWS IAM user access key
- [ ] `AWS_SECRET_ACCESS_KEY` - Your AWS IAM user secret key
- [ ] `AWS_S3_BUCKET_NAME` - Your S3 bucket name

---

## 🔄 After Adding Variables

1. **Redeploy** your Vercel project
2. **Run database migrations:**
   ```bash
   export DATABASE_URL="your-production-database-url"
   npx prisma migrate deploy
   ```
3. **Test the application** at https://konnecthere.com

---

## 📚 Need Help?

- **Database Setup:** See `SUPABASE_SETUP.md` or `DEPLOYMENT.md`
- **AWS Setup:** See `AWS_IAM_SETUP.md` or AWS documentation
- **General Deployment:** See `DEPLOYMENT.md`

