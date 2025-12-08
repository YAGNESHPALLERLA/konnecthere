# 🚀 Railway Database Setup - Complete Steps

## Your Railway Connection String

From your Railway dashboard, use this connection string:

```
postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway
```

**Important:** Use `DATABASE_PUBLIC_URL` (the one with `proxy.rlwy.net`), not the internal one.

## Step-by-Step Setup

### Step 1: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard** → **konnecthere** → **Settings** → **Environment Variables**
2. Find `DATABASE_URL` and click to edit
3. **Replace the value** with:
   ```
   postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway
   ```
4. Make sure **"All Environments"** is selected (Production, Preview, Development)
5. Click **"Save"**

### Step 2: Run Migrations on Railway Database

Open your terminal and run:

```bash
DATABASE_URL="postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway" npx prisma migrate deploy
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "railway", schema "public" at "centerbeam.proxy.rlwy.net:36810"

X migrations found in prisma/migrations
Applying migration `20251207053105_init`
✅ Applied migration: 20251207053105_init
```

### Step 3: Seed the Railway Database

After migrations succeed, seed the database:

```bash
DATABASE_URL="postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway" npm run db:seed
```

**Expected output:**
```
🌱 Seeding database...
✅ Created/updated ADMIN user: admin@konnecthere.com
✅ Created/updated HR user: hr@konnecthere.com
✅ Created/updated company: Sample Company
✅ Created/updated USER: user@konnecthere.com

📋 Seed Summary:
   ADMIN: admin@konnecthere.com / admin123
   HR: hr@konnecthere.com / hr123
   USER: user@konnecthere.com / user123
```

### Step 4: Redeploy in Vercel

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for deployment to complete

### Step 5: Verify Connection

After redeploy, check the connection:

```bash
curl https://www.konnecthere.com/api/debug/auth
```

**Expected response:**
```json
{
  "database": {
    "connected": true,
    "userCount": 3
  }
}
```

### Step 6: Test Login

1. Go to: `https://www.konnecthere.com/auth/signin`
2. Try logging in with:
   - Email: `admin@konnecthere.com`
   - Password: `admin123`
3. Should redirect to `/dashboard/admin` ✅

## Complete Checklist

- [ ] Updated `DATABASE_URL` in Vercel with Railway connection string
- [ ] Ran `npx prisma migrate deploy` with Railway connection string
- [ ] Ran `npm run db:seed` with Railway connection string
- [ ] Redeployed application in Vercel
- [ ] Verified connection at `/api/debug/auth` shows `"connected": true`
- [ ] Verified users exist at `/api/debug/users`
- [ ] Tested login with `admin@konnecthere.com` / `admin123`
- [ ] Login redirects to correct dashboard

## Important Notes

1. **Claim Your Railway Project**: The warning says it will be deleted in 24 hours. Click "Claim Project" to make it permanent.

2. **Connection String**: Always use `DATABASE_PUBLIC_URL` (with `proxy.rlwy.net`) for external connections like Vercel.

3. **No SSL Parameter Needed**: Railway connection strings work without `?sslmode=require` (but adding it won't hurt).

4. **Keep Local DB**: Your local PostgreSQL (`localhost:5432`) is still perfect for development. Only production uses Railway.

## Troubleshooting

### "Can't reach database server"
- Double-check the connection string
- Make sure you're using `DATABASE_PUBLIC_URL` (not internal)
- Verify Railway database is "Online" (green dot)

### "Migration failed"
- Make sure migrations exist: `ls prisma/migrations/`
- Check Railway database is accessible
- Try connection test: `npm run db:test` with Railway URL

### "User not found" after login
- Run seed script: `npm run db:seed` with Railway URL
- Verify users in Railway dashboard (if available) or via `/api/debug/users`

---

**After completing these steps, your production site should work perfectly!** 🎉

