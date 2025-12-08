# 🔍 Database Connection Issue Diagnosis

## Current Status

The live site (`https://www.konnecthere.com`) **cannot connect to the database**:

```
Can't reach database server at `db.vstltyehsgjtcvcxphoh.supabase.co:5432`
```

## What I Found

1. ✅ **Local connection works** - Your terminal test shows database connects successfully
2. ✅ **Database has users** - All 3 test users exist (admin, hr, user)
3. ✅ **Environment variables set** - DATABASE_URL, AUTH_SECRET, etc. are all set in Vercel
4. ❌ **Live site can't connect** - Vercel deployment cannot reach the database

## Possible Causes

### 1. Supabase IP Restrictions (Most Likely)

Supabase might be blocking connections from Vercel's IP addresses.

**Fix:**
1. Go to **Supabase Dashboard** → Your Project → **Settings → Database**
2. Look for **"Connection Pooling"** or **"Network Restrictions"**
3. Check if there are **IP allowlists** or **firewall rules**
4. **Add Vercel IP ranges** or **disable IP restrictions** for your database

### 2. Connection String Format Issue

Even though DATABASE_URL has `?sslmode=require`, Prisma might not be using it correctly.

**Fix:** I've updated the code to ensure SSL is always added. After redeploy, it should work.

### 3. Supabase Connection Pooling vs Direct Connection

You might need to use the **connection pooler** instead of direct connection for Vercel.

**Try this connection string:**
```
postgresql://postgres.vstltyehsgjtcvcxphoh:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```

## Immediate Actions

### Step 1: Check Supabase Network Settings

1. Go to **Supabase Dashboard** → Your Project
2. Go to **Settings → Database**
3. Look for:
   - **"Connection Pooling"** settings
   - **"Network Restrictions"** or **"IP Allowlist"**
   - **"Firewall Rules"**
4. **Disable any IP restrictions** or **add Vercel IP ranges**

### Step 2: Try Connection Pooler URL

If direct connection doesn't work, try the pooler:

1. Go to **Vercel → Environment Variables**
2. Update `DATABASE_URL` to:
   ```
   postgresql://postgres.vstltyehsgjtcvcxphoh:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
3. **Save** and **redeploy**

### Step 3: Verify Supabase Connection String

1. Go to **Supabase Dashboard** → Settings → Database
2. Find **"Connection string"** section
3. Copy the **exact connection string** they provide
4. Make sure it includes SSL parameters
5. Update `DATABASE_URL` in Vercel with that exact string

### Step 4: Check Supabase Project Status

1. Go to **Supabase Dashboard**
2. Check if your project is **active** and **not paused**
3. Check if there are any **billing issues** or **quota limits**

## Code Fix Applied

I've updated `lib/prisma.ts` to:
- ✅ Automatically add `?sslmode=require` for cloud databases
- ✅ Override `process.env.DATABASE_URL` so Prisma uses the SSL-enabled URL
- ✅ Work for Supabase, AWS RDS, Railway, Neon, and other cloud databases

**After redeploy, the code will auto-fix SSL, but you still need to check Supabase network settings!**

## Next Steps

1. **Check Supabase network/firewall settings** (most important!)
2. **Redeploy** after code changes
3. **Test connection** at: `https://www.konnecthere.com/api/debug/auth`
4. **If still failing**, try connection pooler URL

---

**The most likely issue is Supabase blocking Vercel IPs. Check your Supabase network settings!**

