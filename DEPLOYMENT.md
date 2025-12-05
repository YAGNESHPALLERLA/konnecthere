# Deployment Guide - KonnectHere to Vercel

This guide will help you deploy KonnectHere to Vercel and connect your domain `konnecthere.com`.

## 📋 Prerequisites

- ✅ Code pushed to GitHub: `https://github.com/YAGNESHPALLERLA/konnecthere.git`
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Domain `konnecthere.com` ready to configure
- ✅ PostgreSQL database (Supabase, Railway, Neon, or any PostgreSQL provider)

---

## 🚀 Step 1: Push to GitHub

Your code is already committed. Push to GitHub:

```bash
git push -u origin main
```

If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys

---

## 🔧 Step 2: Deploy to Vercel

### 2.1 Import Project

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **"YAGNESHPALLERLA/konnecthere"** from the list
5. Click **"Import"**

### 2.2 Configure Project Settings

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### 2.3 Environment Variables

**⚠️ CRITICAL:** Add these environment variables in Vercel before deploying:

#### Required Variables:

```bash
# Database (Use your production PostgreSQL URL)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# NextAuth (Generate new secret for production)
NEXTAUTH_SECRET=your-production-secret-here
NEXTAUTH_URL=https://konnecthere.com
AUTH_URL=https://konnecthere.com
AUTH_TRUST_HOST=true

# AWS S3 (For resume uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=konnecthere-resumes
```

#### Optional Variables (add if you have them):

```bash
# OAuth Providers
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email/SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=
SMTP_FROM=noreply@konnecthere.com

# Algolia Search
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=
ALGOLIA_INDEX_NAME=jobs

# Resume Parser
RESUME_PARSER_URL=
```

**How to add in Vercel:**
1. In the project settings, go to **"Environment Variables"**
2. Add each variable one by one
3. Select **"Production"**, **"Preview"**, and **"Development"** environments
4. Click **"Save"**

### 2.4 Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at: `https://konnecthere-xxxxx.vercel.app`

---

## 🌐 Step 3: Connect Custom Domain

### 3.1 Add Domain in Vercel

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Enter `konnecthere.com` and click **"Add"**
4. Vercel will show you DNS records to configure

### 3.2 Configure DNS Records

You'll need to add these DNS records in your domain registrar (where you bought konnecthere.com):

#### Option A: Apex Domain (konnecthere.com)

Add these records:

```
Type: A
Name: @
Value: 76.76.21.21
```

#### Option B: CNAME (Recommended)

Add this record:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Note:** Some registrars don't support CNAME on apex domain. If that's the case, use Option A.

#### For www subdomain:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3.3 Verify Domain

1. After adding DNS records, wait 5-60 minutes for DNS propagation
2. Go back to Vercel → Settings → Domains
3. Click **"Refresh"** or wait for automatic verification
4. Once verified, your domain will show as **"Valid Configuration"**

### 3.4 Update Environment Variables

After domain is connected, update these variables:

```bash
NEXTAUTH_URL=https://konnecthere.com
AUTH_URL=https://konnecthere.com
```

Then redeploy your project.

---

## 🗄️ Step 4: Set Up Production Database

### Option A: Supabase (Recommended - Free Tier)

1. Go to https://supabase.com
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string
5. Update `DATABASE_URL` in Vercel environment variables
6. Run migrations:
   ```bash
   # In your local terminal
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```

### Option B: Railway

1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy connection string
4. Update `DATABASE_URL` in Vercel
5. Run migrations

### Option C: Neon

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in Vercel
5. Run migrations

---

## 🔐 Step 5: Generate Production Secrets

### Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

Copy the output and use it as `NEXTAUTH_SECRET` in Vercel.

**⚠️ Important:** Use a different secret for production than development!

---

## 📦 Step 6: Run Database Migrations

After setting up your production database, run migrations:

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

Or use Vercel's build command to auto-generate:

Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## ✅ Step 7: Verify Deployment

1. Visit `https://konnecthere.com`
2. Test user registration
3. Test login
4. Test job posting (if HR user)
5. Test job application (if USER)

---

## 🔄 Step 8: Set Up Continuous Deployment

Vercel automatically deploys on every push to `main` branch:

1. Make changes locally
2. Commit: `git commit -m "Your changes"`
3. Push: `git push origin main`
4. Vercel automatically builds and deploys

---

## 🐛 Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `DATABASE_URL` is correct
- Check that Prisma client is generated

### Domain Not Working

- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check domain status in Vercel dashboard
- Try accessing via `www.konnecthere.com` if apex doesn't work

### Authentication Errors

- Verify `NEXTAUTH_URL` matches your domain exactly
- Ensure `NEXTAUTH_SECRET` is set
- Check that `AUTH_TRUST_HOST=true` is set
- Verify database connection is working

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Ensure database is not paused (Supabase free tier pauses after inactivity)
- Run migrations: `npx prisma migrate deploy`

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

## 🎉 Success!

Once everything is set up, your KonnectHere job portal will be live at:

**https://konnecthere.com**

Good luck with your deployment! 🚀

