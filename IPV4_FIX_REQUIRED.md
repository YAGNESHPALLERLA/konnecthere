# 🔴 CRITICAL: IPv4 Compatibility Issue

## The Problem

Supabase shows: **"Not IPv4 compatible"** - "Use Session Pooler if on a IPv4 network"

**Vercel uses IPv4**, but Supabase's **direct connection is IPv6-only**. This is why the connection fails!

## The Solution: Use Session Pooler

You **MUST** use the **Session Pooler** connection string, not the direct connection.

## Step-by-Step Fix

### Step 1: Get Session Pooler Connection String

1. In Supabase Dashboard, go to **Settings → Database**
2. Click **"Connect"** button (or go to Connection String section)
3. In the modal, change **"Method"** dropdown to **"Session Pooler"** (not "Direct connection")
4. Copy the connection string - it should look like:
   ```
   postgresql://postgres.toluzrymeoossrfbwpve:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 2: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard → konnecthere → Settings → Environment Variables**
2. Click on `DATABASE_URL` to edit
3. **Replace** the value with the **Session Pooler** connection string
4. **Add `?sslmode=require`** at the end:
   ```
   postgresql://postgres.toluzrymeoossrfbwpve:yagnesh_0504@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```
5. Make sure "All Environments" is selected
6. Click **"Save"**

### Step 3: Run Migrations with Pooler Connection

```bash
# Use the Session Pooler connection string
DATABASE_URL="postgresql://postgres.toluzrymeoossrfbwpve:yagnesh_0504@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require" npx prisma migrate deploy
```

### Step 4: Seed Database with Pooler Connection

```bash
DATABASE_URL="postgresql://postgres.toluzrymeoossrfbwpve:yagnesh_0504@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require" npm run db:seed
```

### Step 5: Redeploy in Vercel

1. Go to **Vercel Dashboard → Deployments**
2. Click **"..."** → **"Redeploy"**
3. Wait 2-3 minutes

### Step 6: Verify

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

## Important Notes

- ✅ **Session Pooler** works with IPv4 (Vercel compatible)
- ❌ **Direct connection** is IPv6-only (doesn't work with Vercel)
- ✅ Session Pooler uses port **6543** (not 5432)
- ✅ Username format: `postgres.toluzrymeoossrfbwpve` (not just `postgres`)

## Connection String Format

**Session Pooler (CORRECT for Vercel):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

**Direct Connection (WRONG - IPv6 only):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

**The fix: Use Session Pooler connection string in Vercel DATABASE_URL!**

