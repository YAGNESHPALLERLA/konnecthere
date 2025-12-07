# 🔴 CRITICAL: Database Connection Issue

## The Problem

The database connection is failing with:
```
Can't reach database server at `db.vstltyehsgjtcvcxphoh.supabase.co:5432`
```

## Root Cause

Supabase requires **SSL/TLS connection** for direct connections. The connection string needs `?sslmode=require` parameter.

## The Fix

### Update DATABASE_URL in Vercel

Go to **Vercel Dashboard → konnecthere → Settings → Environment Variables**

1. Click on `DATABASE_URL` to edit
2. **Replace the value** with this (with SSL parameter):

```
postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres?sslmode=require
```

**Key addition**: `?sslmode=require` at the end

3. Make sure "All Environments" is selected
4. Click **"Save"**

### Alternative: Use Connection Pooler (If Direct Connection Doesn't Work)

If the direct connection still doesn't work, Supabase might require using the connection pooler. In that case, use:

```
postgresql://postgres.vstltyehsgjtcvcxphoh:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**But first try the direct connection with SSL!**

## Steps to Fix

1. **Update DATABASE_URL** in Vercel with `?sslmode=require` parameter
2. **Redeploy** the application
3. **Wait 2-3 minutes** for deployment
4. **Check connection** at: `https://www.konnecthere.com/api/debug/auth`
   - Should show: `"database": { "connected": true }`
5. **Seed the database** (if users don't exist):
   ```bash
   DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres?sslmode=require" npm run db:seed
   ```
6. **Test login** at: `https://www.konnecthere.com/auth/signin`

## Verify Connection String Format

Your DATABASE_URL should look like:
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require
```

For your Supabase:
```
postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres?sslmode=require
```

## Check Supabase Dashboard

1. Go to your Supabase project dashboard
2. Go to **Settings → Database**
3. Check the **Connection string** section
4. Make sure you're using the **"Direct connection"** (not pooler)
5. Copy the connection string and add `?sslmode=require` if it's not there

## After Fixing

Once the connection works, you should see:
- `"databaseConnected": true` in `/api/debug/auth`
- Users can be queried in `/api/debug/users`
- Login will work!

---

**The main issue is missing `?sslmode=require` in the DATABASE_URL!**
