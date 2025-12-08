# 🔴 CRITICAL: IPv4 Compatibility Issue

## The Problem

Supabase shows: **"Not IPv4 compatible"** for direct connection.

**Vercel uses IPv4**, but Supabase's direct connection (`db.xxx.supabase.co:5432`) is **IPv6-only**.

This is why the connection fails!

## The Solution

You **MUST use the Session Pooler** instead of direct connection for Vercel.

## Step 1: Get Session Pooler Connection String

1. In Supabase Dashboard → "Connect to your project" modal
2. Change **"Method"** dropdown from **"Direct connection"** to **"Session Pooler"**
3. Copy the connection string - it should look like:
   ```
   postgresql://postgres.toluzrymeoossrfbwpve:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

## Step 2: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard → konnecthere → Settings → Environment Variables**
2. Click on `DATABASE_URL` to edit
3. **Replace with Session Pooler connection string:**
   ```
   postgresql://postgres.toluzrymeoossrfbwpve:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
   **Important:** 
   - Use `postgres.toluzrymeoossrfbwpve` (with project ref in username)
   - Use `pooler.supabase.com` (not `db.xxx.supabase.co`)
   - Use port `6543` (not `5432`)
   - Add `?sslmode=require` at the end
4. Make sure "All Environments" is selected
5. Click **"Save"**

## Step 3: Run Migrations with Pooler Connection

```bash
DATABASE_URL="postgresql://postgres.toluzrymeoossrfbwpve:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require" npx prisma migrate deploy
```

## Step 4: Seed Database with Pooler Connection

```bash
DATABASE_URL="postgresql://postgres.toluzrymeoossrfbwpve:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require" npm run db:seed
```

## Step 5: Redeploy in Vercel

1. Go to **Vercel Dashboard → Deployments**
2. Click **"..."** → **"Redeploy"**
3. Wait 2-3 minutes

## Step 6: Verify

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

## Connection String Format

**❌ WRONG (Direct - IPv6 only):**
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

**✅ CORRECT (Session Pooler - IPv4 compatible):**
```
postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require
```

**Key differences:**
- Username: `postgres.xxx` (with project ref) vs `postgres`
- Host: `pooler.supabase.com` vs `db.xxx.supabase.co`
- Port: `6543` vs `5432`

---

**This is the root cause! Vercel needs Session Pooler because it's IPv4-only!**

