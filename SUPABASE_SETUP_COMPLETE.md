# 🔧 Complete Supabase Setup Guide

## Critical Issue Found

Your Supabase dashboard shows **"Tables: 0"** - this means **migrations haven't been run** on your production database!

## Step-by-Step Fix

### Step 1: Get Your Supabase Connection String

1. In Supabase Dashboard, go to **Settings → Database**
2. Scroll down to **"Connection string"** section
3. Select **"URI"** tab (not "Connection Pooling")
4. Copy the connection string - it should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OR for direct connection:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Step 2: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard → konnecthere → Settings → Environment Variables**
2. Click on `DATABASE_URL` to edit
3. **Paste the exact connection string from Supabase**
4. **Add `?sslmode=require`** at the end if it's not there
5. Make sure "All Environments" is selected
6. Click **"Save"**

### Step 3: Run Migrations on Production Database

Open your terminal and run:

```bash
# Get your connection string from Supabase (with ?sslmode=require)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" npx prisma migrate deploy
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.xxx.supabase.co:5432"

X migrations found in prisma/migrations
X migrations already applied to database.
```

If you see "0 migrations found", you need to create migrations first:
```bash
DATABASE_URL="your-connection-string" npx prisma migrate dev --name init
```

### Step 4: Seed the Database

After migrations are applied:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" npm run db:seed
```

**Expected output:**
```
🌱 Seeding database...
✅ Created/updated ADMIN user: admin@konnecthere.com
✅ Created/updated HR user: hr@konnecthere.com
✅ Created/updated company: Sample Company
✅ Created/updated USER: user@konnecthere.com
```

### Step 5: Verify in Supabase Dashboard

1. Go back to **Supabase Dashboard → Table Editor**
2. You should now see tables:
   - `User`
   - `Account`
   - `Session`
   - `Job`
   - `Company`
   - etc.
3. Click on `User` table - you should see 3 users (admin, hr, user)

### Step 6: Check Network Settings (If Still Failing)

1. In Supabase Dashboard, go to **Settings → Database**
2. Look for **"Connection Pooling"** or **"Network Restrictions"**
3. Make sure there are **no IP restrictions** blocking Vercel
4. If you see IP allowlists, either:
   - Disable them, OR
   - Add Vercel's IP ranges (not recommended - use connection pooler instead)

### Step 7: Redeploy in Vercel

1. Go to **Vercel Dashboard → Deployments**
2. Click **"..."** → **"Redeploy"**
3. Wait 2-3 minutes

### Step 8: Verify Connection

After redeploy, check:

```bash
curl https://www.konnecthere.com/api/debug/auth
```

Should show:
```json
{
  "database": {
    "connected": true,
    "userCount": 3
  }
}
```

## Quick Checklist

- [ ] Got connection string from Supabase Dashboard
- [ ] Updated DATABASE_URL in Vercel with `?sslmode=require`
- [ ] Ran `npx prisma migrate deploy` against production DB
- [ ] Ran `npm run db:seed` against production DB
- [ ] Verified tables exist in Supabase Table Editor
- [ ] Verified users exist in User table
- [ ] Checked Supabase network settings (no IP restrictions)
- [ ] Redeployed in Vercel
- [ ] Tested connection at `/api/debug/auth`
- [ ] Tested login at `/auth/signin`

## Common Issues

### "0 migrations found"
**Solution:** Create migrations first:
```bash
DATABASE_URL="your-connection-string" npx prisma migrate dev --name init
```

### "Can't reach database server"
**Solution:** 
1. Check if connection string is correct
2. Make sure `?sslmode=require` is added
3. Check Supabase network/firewall settings
4. Try connection pooler URL instead

### "Tables: 0" in Supabase Dashboard
**Solution:** Run migrations - tables haven't been created yet!

---

**The main issue is that migrations haven't been run on your production database. Run `npx prisma migrate deploy` with your Supabase connection string!**

