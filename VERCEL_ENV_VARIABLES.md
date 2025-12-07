# Vercel Environment Variables - Your Configuration

## 🔴 CRITICAL - Add These First

Copy and paste these into Vercel Dashboard → Settings → Environment Variables:

### 1. DATABASE_URL
**Important:** For Vercel, use the **Connection Pooler** URL (port 6543), not direct connection (port 5432)

**To get the correct pooler URL:**
1. Go to Supabase Dashboard → Settings → Database
2. Scroll to "Connection Pooling"
3. Copy the "Connection string" under "Session mode" or "Transaction mode"
4. It should look like one of these formats:

**Format 1 (Session mode - Recommended):**
```
postgresql://postgres.vstltyehsgjtcvcxphoh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Format 2 (Transaction mode):**
```
postgresql://postgres.vstltyehsgjtcvcxphoh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Replace `[YOUR-PASSWORD]` with:** `yagnesh_0504`

**If you can't find the pooler URL, you can construct it:**
```
postgresql://postgres.vstltyehsgjtcvcxphoh:yagnesh_0504@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Note:** 
- Use port `6543` for Session mode (recommended for Vercel)
- Use port `5432` with `?pgbouncer=true` for Transaction mode
- The pooler URL is different from the direct connection URL

**Environment:** Production, Preview, Development

---

### 2. NEXTAUTH_SECRET
```
I62bfzGD9SmEst8tIxhRCN04ISJNimRVTeHuZ1VJB6Y=
```

**Environment:** Production, Preview, Development

---

### 3. NEXTAUTH_URL
**Replace `your-app-name` with your actual Vercel app name:**

```
https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app
```

**OR if you have a custom domain:**
```
https://your-custom-domain.com
```

**Environment:** Production

**For Preview:**
```
https://konnecthere-[hash]-yagnesh-pallerlas-projects.vercel.app
```

**For Development:**
```
http://localhost:3000
```

---

### 4. AUTH_URL
**Same as NEXTAUTH_URL:**
```
https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app
```

**Environment:** Production, Preview, Development

---

## 🟡 IMPORTANT - For Resume Uploads

### 5. AWS S3 Configuration

You still need to set up AWS S3 for resume uploads. See `VERCEL_SETUP_GUIDE.md` for detailed instructions.

**Required variables:**
- `AWS_REGION` (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

---

## 📋 Quick Steps to Add in Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your **konnecthere** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable above (one by one)
6. Make sure to select the correct **Environment** (Production/Preview/Development)
7. Click **Save**

---

## 🔄 After Adding Variables:

1. **Redeploy your app** in Vercel dashboard
2. **Run database migrations** (see below)

---

## 🗄️ Run Database Migrations

After adding `DATABASE_URL`, run migrations:

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

### Option 2: Using Supabase SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL from your Prisma migrations
3. Run the SQL in the editor

---

## ✅ Verify Setup

After adding variables and running migrations:

1. Visit your Vercel app URL
2. Try signing up with email/password
3. Check if the database connection works

---

## 🔐 Security Note

**Important:** The database password is visible in the connection string. Consider:
1. Changing the database password in Supabase Dashboard → Settings → Database
2. Using environment variables to store sensitive values
3. Never commit connection strings to git

---

## 🆘 Troubleshooting

### Connection Issues

If you get connection errors:
1. **Use Connection Pooler:** Make sure you're using port `6543` with `?pgbouncer=true`
2. **Check Supabase Dashboard:** Go to Settings → Database → Connection Pooling
3. **IPv4 Issue:** The direct connection (port 5432) may not work on Vercel. Always use the pooler.

### Migration Errors

If migrations fail:
1. Check if `DATABASE_URL` is correct in Vercel
2. Verify the connection string includes `?pgbouncer=true`
3. Try running migrations locally with the connection string

---

## 📝 Next Steps

1. ✅ Add all environment variables above
2. ✅ Run database migrations
3. ✅ Set up AWS S3 for resume uploads
4. ✅ (Optional) Configure OAuth providers
5. ✅ Test your application
