# 🔴 URGENT FIX - Production Login Not Working

## The Problem

Your `DATABASE_URL` in Vercel is using the **connection pooler** (port 6543) which doesn't work properly with Prisma/Auth.js. You need to use the **direct connection** (port 5432).

## Current (WRONG) DATABASE_URL:
```
postgresql://postgres.vstltyehsgjtcvcxphoh:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

## Correct DATABASE_URL (USE THIS):
```
postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres
```

**Key differences:**
- Username: `postgres` (not `postgres.vstltyehsgjtcvcxphoh`)
- Host: `db.vstltyehsgjtcvcxphoh.supabase.co` (not `aws-0-ap-south-1.pooler.supabase.com`)
- Port: `5432` (not `6543`)

## Step-by-Step Fix

### Step 1: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard → konnecthere → Settings → Environment Variables**
2. Find `DATABASE_URL`
3. Click on it to edit
4. **Replace the entire value** with:
   ```
   postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres
   ```
5. Make sure "All Environments" is selected
6. Click **"Save"**

### Step 2: Add AUTH_SECRET (if missing)

1. In the same Environment Variables page
2. Check if `AUTH_SECRET` exists
3. If it doesn't exist, click **"Add New"**
4. Name: `AUTH_SECRET`
5. Value: `I62bfzGD9SmEst8tIxhRCN04ISJNimRVTeHuZ1VJB6Y=` (same as NEXTAUTH_SECRET)
6. Environments: "All Environments"
7. Click **"Save"**

### Step 3: Enable Debug Mode (Temporarily)

1. In Environment Variables, click **"Add New"**
2. Name: `ALLOW_DEBUG`
3. Value: `true`
4. Environments: "All Environments"
5. Click **"Save"**

This will let us check if the database connection works.

### Step 4: Redeploy Application

1. Go to **Vercel Dashboard → Deployments**
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (2-3 minutes)

### Step 5: Verify Database Connection

After redeploy, visit:
```
https://www.konnecthere.com/api/debug/users
```

**Expected response:**
```json
{
  "success": true,
  "databaseConnected": true,
  "testUsers": {
    "admin": { "exists": true, "hasPassword": true },
    "hr": { "exists": true, "hasPassword": true },
    "user": { "exists": true, "hasPassword": true }
  }
}
```

**If you see `"databaseConnected": false`**: The DATABASE_URL is still wrong. Double-check Step 1.

**If you see `"exists": false` for test users**: You need to seed the database (Step 6).

### Step 6: Seed Production Database

Open your terminal and run:

```bash
# First, test the connection
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma db pull

# If that works, run migrations
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma migrate deploy

# Then seed the database
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npm run db:seed
```

**Expected output:**
```
🌱 Seeding database...
✅ Created/updated ADMIN user: admin@konnecthere.com
✅ Created/updated HR user: hr@konnecthere.com
✅ Created/updated company: Sample Company
✅ Created/updated USER: user@konnecthere.com
```

### Step 7: Test Login

1. Go to: `https://www.konnecthere.com/auth/signin`
2. Try logging in with:
   - Email: `admin@konnecthere.com`
   - Password: `admin123`

**If it still doesn't work**, check Vercel logs:
1. Go to **Vercel Dashboard → Deployments → Latest Deployment**
2. Click **"View Function Logs"**
3. Try logging in again
4. Look for `[AUTH]` messages in the logs

### Step 8: Disable Debug Mode (After Fixing)

Once everything works:
1. Go back to **Environment Variables**
2. Find `ALLOW_DEBUG`
3. Either delete it or set value to `false`
4. Redeploy

## Quick Checklist

- [ ] Updated DATABASE_URL to direct connection (port 5432)
- [ ] Added AUTH_SECRET (same value as NEXTAUTH_SECRET)
- [ ] Enabled ALLOW_DEBUG temporarily
- [ ] Redeployed application
- [ ] Verified database connection at `/api/debug/users`
- [ ] Seeded production database
- [ ] Tested login with admin@konnecthere.com / admin123
- [ ] Disabled ALLOW_DEBUG after verification

## Common Issues

**"Database connection error" in logs:**
- DATABASE_URL is still using pooler (port 6543)
- Fix: Use direct connection (port 5432)

**"User not found" in logs:**
- Database doesn't have seeded users
- Fix: Run `npm run db:seed` with production DATABASE_URL

**"Invalid password" in logs:**
- User exists but password hash is wrong
- Fix: Re-run seed script to update passwords

---

**The most important fix is Step 1 - updating DATABASE_URL to use port 5432 instead of 6543!**

