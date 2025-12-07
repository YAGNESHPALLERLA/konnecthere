# Fix Login Issue - Step by Step

## Problem
Login is failing because:
1. Missing `AUTH_URL` environment variable in Vercel
2. Test users don't exist in production database (only created locally)

## Solution

### Step 1: Add Missing Environment Variable

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add this variable:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `AUTH_URL` | `https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app` | Production, Preview, Development |

**Important:** Use your actual Vercel app URL (same as NEXTAUTH_URL)

---

### Step 2: Create Test Users in Production Database

Run the seed script against your production database:

```bash
# Set your production database URL
export DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres"

# Run seed script
npm run db:seed
```

Or run it directly:

```bash
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npm run db:seed
```

This will create:
- `admin@konnecthere.com` / `admin123`
- `hr@konnecthere.com` / `hr123`
- `user@konnecthere.com` / `user123`

---

### Step 3: Redeploy Vercel App

After adding `AUTH_URL`:
1. Go to Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"

---

### Step 4: Test Login

After redeploy, try logging in with:
- Email: `admin@konnecthere.com`
- Password: `admin123`

---

## Quick Fix Commands

```bash
# 1. Add test users to production database
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npm run db:seed

# 2. Verify users were created (optional)
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma studio
```

---

## After Fixing

Your environment variables in Vercel should be:
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`
- ✅ `AUTH_URL` ← **ADD THIS ONE**

Then test users will be in production database and login should work!

