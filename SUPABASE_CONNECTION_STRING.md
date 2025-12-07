# Supabase Connection String for Vercel

## Your Connection Pooler URL

Based on your Supabase project details:
- Project Reference: `vstltyehsgjtcvcxphoh`
- Region: `ap-south-1` (AWS)
- Password: `yagnesh_0504`

### Use This Connection String for Vercel:

**For Production/Preview/Development:**
```
postgresql://postgres.vstltyehsgjtcvcxphoh:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

---

## Alternative: Find it in Supabase Dashboard

If you want to find it manually:

### Method 1: From "Connect to your project" Modal

1. In Supabase Dashboard, click the **"Connect"** button (top right)
2. Select the **"Connection String"** tab
3. Change **"Method"** dropdown to **"Connection Pooler"**
4. Select **"Session mode"** (recommended for Vercel)
5. Copy the connection string shown
6. Replace `[YOUR-PASSWORD]` with `yagnesh_0504`

### Method 2: From Database Settings

1. Go to: **Settings** → **Database**
2. Scroll down to find **"Connection Pooling"** section
3. Look for connection strings there

### Method 3: From Project Settings → Database

1. Go to: **Project Settings** (gear icon) → **Database**
2. Look for **"Connection Pooling"** section
3. Copy the connection string

---

## Quick Copy-Paste for Vercel

**Just use this directly in Vercel:**

```
postgresql://postgres.vstltyehsgjtcvcxphoh:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

This is the **Session mode** connection pooler URL, which is recommended for Vercel serverless functions.

---

## Important Notes

1. **Port 6543** = Session mode (recommended for Vercel)
2. **Port 5432 with ?pgbouncer=true** = Transaction mode (alternative)
3. Always use the **pooler** URL for Vercel, not the direct connection
4. The pooler URL format: `postgres.vstltyehsgjtcvcxphoh` (with dot, not underscore)

---

## Next Steps

1. Copy the connection string above
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Add `DATABASE_URL` with the connection string above
4. Select all environments (Production, Preview, Development)
5. Save and redeploy

