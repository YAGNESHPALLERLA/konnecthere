# Fix Database Connection Error

## 🔴 Problem

The error `FATAL: Tenant or user not found` means your `DATABASE_URL` in Vercel is incorrect.

## ✅ Solution

### Step 1: Update DATABASE_URL in Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Find `DATABASE_URL` and **UPDATE** it to use the **direct connection** (not pooler):

**Current (WRONG - if using pooler):**
```
postgresql://postgres.vstltyehsgjtcvcxphoh:yagnesh_0504@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**Correct (USE THIS):**
```
postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres
```

**Key differences:**
- Username: `postgres` (not `postgres.vstltyehsgjtcvcxphoh`)
- Host: `db.vstltyehsgjtcvcxphoh.supabase.co` (not `aws-0-ap-south-1.pooler.supabase.com`)
- Port: `5432` (not `6543`)

### Step 2: Verify All Environment Variables

Make sure you have ALL of these set correctly:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `I62bfzGD9SmEst8tIxhRCN04ISJNimRVTeHuZ1VJB6Y=` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://www.konnecthere.com` | Production |
| `AUTH_URL` | `https://www.konnecthere.com` | Production, Preview, Development |

### Step 3: Redeploy

After updating `DATABASE_URL`:
1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** → **"Redeploy"**
3. Wait for deployment to complete

### Step 4: Test

1. Visit: `https://www.konnecthere.com/api/test-db`
   - Should show: `{"success":true,"databaseConnected":true,...}`
2. Try logging in:
   - Email: `admin@konnecthere.com`
   - Password: `admin123`

---

## 🔍 Why This Happens

Supabase has two connection methods:
1. **Direct connection** (port 5432) - Works everywhere ✅
2. **Connection pooler** (port 6543) - Requires specific format and may not work with all clients ❌

For Vercel, use the **direct connection** which we've tested and confirmed works.

---

## ✅ After Fix

Once you update `DATABASE_URL` to the direct connection format, the login should work immediately!

