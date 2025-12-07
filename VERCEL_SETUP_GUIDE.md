# Vercel Setup Guide - Complete Configuration

This guide will help you configure your Vercel deployment to make your website fully functional.

## 📍 Step 1: Access Vercel Environment Variables

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your **konnecthere** project
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables (one by one or import all at once)

---

## 🔴 CRITICAL - Must Configure (App won't work without these)

### 1. Database Configuration

**Variable Name:** `DATABASE_URL`  
**Value:** Your PostgreSQL connection string

**Options to get a database:**

#### Option A: Supabase (Recommended - Free Tier)
1. Go to https://supabase.com and create an account
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)
5. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

#### Option B: Neon (Free Tier)
1. Go to https://neon.tech and create an account
2. Create a new project
3. Copy the connection string from the dashboard

#### Option C: Railway (Free Tier)
1. Go to https://railway.app and create an account
2. Create a new PostgreSQL database
3. Copy the connection string

**Add to Vercel:**
- Key: `DATABASE_URL`
- Value: `postgresql://user:password@host:port/database?schema=public`
- Environment: Select **Production**, **Preview**, and **Development**

---

### 2. NextAuth Configuration

#### Generate NEXTAUTH_SECRET

Run this command locally (or use any online generator):
```bash
openssl rand -base64 32
```

Copy the output - this is your secret.

**Add to Vercel:**
- Key: `NEXTAUTH_SECRET`
- Value: `[paste the generated secret]`
- Environment: **Production**, **Preview**, **Development**

#### Set NEXTAUTH_URL

**Add to Vercel:**
- Key: `NEXTAUTH_URL`
- Value: `https://your-app-name.vercel.app` (replace with your actual Vercel URL)
- Environment: **Production**

For Preview/Development, you can use:
- Preview: `https://your-app-name-git-[branch]-your-team.vercel.app`
- Development: `http://localhost:3000`

#### Set AUTH_URL

**Add to Vercel:**
- Key: `AUTH_URL`
- Value: `https://your-app-name.vercel.app` (same as NEXTAUTH_URL)
- Environment: **Production**, **Preview**, **Development**

---

## 🟡 IMPORTANT - For Resume Upload Feature

### 3. AWS S3 Configuration

You need AWS S3 to store resume files. Without this, resume uploads won't work.

#### Setup AWS S3:

1. **Create AWS Account** (if you don't have one): https://aws.amazon.com
2. **Create S3 Bucket:**
   - Go to S3 Console
   - Click "Create bucket"
   - Name: `konnecthere-resumes` (or any name you prefer)
   - Region: Choose closest to you (e.g., `us-east-1`)
   - Uncheck "Block all public access" (or configure CORS properly)
   - Click "Create bucket"

3. **Create IAM User for S3 Access:**
   - Go to IAM Console → Users → Create User
   - Name: `konnecthere-s3-user`
   - Attach policy: `AmazonS3FullAccess` (or create custom policy with only needed permissions)
   - Create Access Key
   - **Save the Access Key ID and Secret Access Key** (you won't see the secret again!)

4. **Configure CORS on S3 Bucket:**
   - Go to your S3 bucket → Permissions → CORS
   - Add this configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-app-name.vercel.app", "http://localhost:3000"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

**Add to Vercel:**
- Key: `AWS_REGION`
- Value: `us-east-1` (or your bucket region)
- Environment: **Production**, **Preview**, **Development**

- Key: `AWS_ACCESS_KEY_ID`
- Value: `[your AWS access key ID]`
- Environment: **Production**, **Preview**, **Development**

- Key: `AWS_SECRET_ACCESS_KEY`
- Value: `[your AWS secret access key]`
- Environment: **Production**, **Preview**, **Development**

- Key: `AWS_S3_BUCKET_NAME`
- Value: `konnecthere-resumes` (or your bucket name)
- Environment: **Production**, **Preview**, **Development**

---

## 🟢 OPTIONAL - Additional Features

### 4. OAuth Providers (For Social Login)

#### LinkedIn OAuth (Optional)

1. Go to https://www.linkedin.com/developers/apps
2. Create a new app
3. Get **Client ID** and **Client Secret**
4. Add redirect URL: `https://your-app-name.vercel.app/api/auth/callback/linkedin`

**Add to Vercel:**
- Key: `LINKEDIN_CLIENT_ID`
- Value: `[your LinkedIn client ID]`
- Environment: **Production**, **Preview**, **Development**

- Key: `LINKEDIN_CLIENT_SECRET`
- Value: `[your LinkedIn client secret]`
- Environment: **Production**, **Preview**, **Development**

#### Google OAuth (Optional)

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-app-name.vercel.app/api/auth/callback/google`

**Add to Vercel:**
- Key: `GOOGLE_CLIENT_ID`
- Value: `[your Google client ID]`
- Environment: **Production**, **Preview**, **Development**

- Key: `GOOGLE_CLIENT_SECRET`
- Value: `[your Google client secret]`
- Environment: **Production**, **Preview**, **Development**

---

### 5. Email/SMTP Configuration (Optional - For Email Auth)

If you want email/password authentication with email verification:

**Option A: SendGrid (Recommended)**
1. Create account at https://sendgrid.com
2. Create API key
3. Verify sender email

**Add to Vercel:**
- Key: `SMTP_HOST`
- Value: `smtp.sendgrid.net`
- Environment: **Production**, **Preview**, **Development**

- Key: `SMTP_PORT`
- Value: `587`
- Environment: **Production**, **Preview**, **Development**

- Key: `SMTP_USER`
- Value: `apikey`
- Environment: **Production**, **Preview**, **Development**

- Key: `SMTP_PASSWORD`
- Value: `[your SendGrid API key]`
- Environment: **Production**, **Preview**, **Development**

- Key: `SMTP_FROM`
- Value: `noreply@yourdomain.com`
- Environment: **Production**, **Preview**, **Development**

---

### 6. Algolia Search (Optional - For Advanced Search)

1. Create account at https://www.algolia.com
2. Create a new application
3. Get **Application ID** and **Admin API Key**
4. Create an index named `jobs`

**Add to Vercel:**
- Key: `ALGOLIA_APP_ID`
- Value: `[your Algolia app ID]`
- Environment: **Production**, **Preview**, **Development**

- Key: `ALGOLIA_API_KEY`
- Value: `[your Algolia admin API key]`
- Environment: **Production**, **Preview**, **Development**

- Key: `ALGOLIA_INDEX_NAME`
- Value: `jobs`
- Environment: **Production**, **Preview**, **Development**

---

### 7. Resume Parser (Optional)

If you have a resume parser service running:

**Add to Vercel:**
- Key: `RESUME_PARSER_URL`
- Value: `https://your-parser-service.com` (or leave empty if not using)
- Environment: **Production**, **Preview**, **Development**

---

## 📋 Quick Checklist

After adding all variables, verify:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Generated secret (32+ characters)
- [ ] `NEXTAUTH_URL` - Your Vercel production URL
- [ ] `AUTH_URL` - Same as NEXTAUTH_URL
- [ ] `AWS_REGION` - S3 region
- [ ] `AWS_ACCESS_KEY_ID` - AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret key
- [ ] `AWS_S3_BUCKET_NAME` - S3 bucket name
- [ ] (Optional) OAuth credentials if using social login
- [ ] (Optional) SMTP credentials if using email auth
- [ ] (Optional) Algolia credentials if using advanced search

---

## 🗄️ Step 2: Run Database Migrations

After setting up the database, you need to run Prisma migrations:

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Option B: Using Database Client

Connect to your database using any PostgreSQL client (pgAdmin, DBeaver, etc.) and run the SQL from your Prisma migrations folder.

### Option C: Using Prisma Studio (For Development)

```bash
npx prisma studio
```

Then manually create tables or run migrations.

---

## 🔄 Step 3: Redeploy Your Application

After adding all environment variables:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

---

## ✅ Step 4: Verify Everything Works

1. **Visit your site:** `https://your-app-name.vercel.app`
2. **Test authentication:**
   - Try signing up with email/password
   - Try OAuth login (if configured)
3. **Test resume upload:**
   - Create a candidate account
   - Try uploading a resume
4. **Test job posting:**
   - Create an employer account
   - Try posting a job

---

## 🐛 Troubleshooting

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check if your database allows connections from Vercel's IPs
- For Supabase: Check if connection pooling is enabled (use port 6543 for pooling)

### Authentication Not Working

- Verify `NEXTAUTH_SECRET` is set and matches across environments
- Check `NEXTAUTH_URL` matches your actual domain
- Verify OAuth callback URLs are correct in provider settings

### Resume Upload Failing

- Verify AWS credentials are correct
- Check S3 bucket CORS configuration
- Verify bucket name matches `AWS_S3_BUCKET_NAME`
- Check IAM user has proper permissions

### Build Errors

- Check Vercel build logs for specific errors
- Verify all required environment variables are set
- Check Node.js version (should be 20.x)

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure database migrations have run

---

## 🎉 You're All Set!

Once all environment variables are configured and migrations are run, your website should be fully functional!

