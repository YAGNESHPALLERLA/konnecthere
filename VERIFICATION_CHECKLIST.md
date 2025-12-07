# Production Deployment Verification Checklist

Use this checklist to verify everything is set up correctly for production.

## ✅ Code Verification (Already Complete)

- [x] `authorize()` function always queries database (no dev-only logic)
- [x] All hardcoded `localhost:3000` URLs removed
- [x] Environment variables properly validated with fail-fast errors
- [x] Enhanced logging added (no password logging)
- [x] Debug endpoints created and protected
- [x] CI/CD fixed to not require production DB
- [x] Seed script verified and production-ready

## 🔧 Vercel Configuration Steps

### Step 1: Set Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Set these for **Production**, **Preview**, and **Development**:

| Variable | Production Value | Preview Value | Development Value |
|----------|-----------------|---------------|-------------------|
| `DATABASE_URL` | Your production DB connection string | Same as production | `postgresql://...` |
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` | Same as production | Same as production |
| `NEXTAUTH_SECRET` | Same as `AUTH_SECRET` | Same as `AUTH_SECRET` | Same as `AUTH_SECRET` |
| `AUTH_URL` | `https://konnecthere.com` | `https://your-preview.vercel.app` | `http://localhost:3000` |
| `NEXTAUTH_URL` | `https://konnecthere.com` | `https://your-preview.vercel.app` | `http://localhost:3000` |

**Important Notes:**
- Use **direct connection** for `DATABASE_URL` (port 5432), not pooler (port 6543)
- For Supabase: Use `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
- NOT: `postgresql://postgres.xxx:password@aws-0-xxx.pooler.supabase.com:6543/postgres`

### Step 2: Run Database Migrations

```bash
# Get your production DATABASE_URL from Vercel dashboard
# Then run:
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

Expected output:
```
✅ Applied migration: 20240101000000_init
✅ Applied migration: 20240101000001_add_users
...
```

### Step 3: Seed Production Database

```bash
DATABASE_URL="your-production-db-url" npm run db:seed
# OR
DATABASE_URL="your-production-db-url" npx prisma db seed
```

Expected output:
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

⚠️  Remember to change these passwords in production!
```

### Step 4: Redeploy Application

1. Go to **Vercel Dashboard → Deployments**
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

## 🧪 Verification Tests

### Test 1: Environment Variables

**If `ALLOW_DEBUG=true` is set**, visit:
```
https://konnecthere.com/api/debug/env
```

**Expected Response:**
```json
{
  "env": {
    "NODE_ENV": "production",
    "hasDATABASE_URL": true,
    "hasAUTH_SECRET": true,
    "hasNEXTAUTH_SECRET": true,
    "hasAUTH_URL": true,
    "hasNEXTAUTH_URL": true,
    "AUTH_URL": "https://konnecthere.com",
    "NEXTAUTH_URL": "https://konnecthere.com"
  }
}
```

**If any are `false`**: Go back to Step 1 and set missing variables.

### Test 2: Database Users

**If `ALLOW_DEBUG=true` is set**, visit:
```
https://konnecthere.com/api/debug/users
```

**Expected Response:**
```json
{
  "success": true,
  "totalUsers": 3,
  "testUsers": {
    "admin": { "exists": true, "role": "ADMIN", "status": "ACTIVE", "hasPassword": true },
    "hr": { "exists": true, "role": "HR", "status": "ACTIVE", "hasPassword": true },
    "user": { "exists": true, "role": "USER", "status": "ACTIVE", "hasPassword": true }
  },
  "databaseConnected": true
}
```

**If users don't exist**: Go back to Step 3 and run seed script.

**If `databaseConnected: false`**: Check `DATABASE_URL` - use direct connection (port 5432).

### Test 3: Authentication Configuration

**If `ALLOW_DEBUG=true` is set**, visit:
```
https://konnecthere.com/api/debug/auth
```

**Expected Response:**
```json
{
  "success": true,
  "environment": {
    "hasDATABASE_URL": true,
    "hasAUTH_SECRET": true,
    "hasAUTH_URL": true,
    "AUTH_URL": "https://konnecthere.com"
  },
  "database": {
    "connected": true,
    "userCount": 3
  },
  "session": {
    "authenticated": false
  }
}
```

### Test 4: Login Test

1. Go to: `https://konnecthere.com/auth/signin`
2. Try logging in with each test user:

**Admin Login:**
- Email: `admin@konnecthere.com`
- Password: `admin123`
- **Expected**: Redirects to `/dashboard/admin`

**HR Login:**
- Email: `hr@konnecthere.com`
- Password: `hr123`
- **Expected**: Redirects to `/dashboard/hr`

**User Login:**
- Email: `user@konnecthere.com`
- Password: `user123`
- **Expected**: Redirects to `/dashboard/user`

**If login fails**: Check Vercel logs (see Test 5).

### Test 5: Check Vercel Logs

1. Go to **Vercel Dashboard → Deployments**
2. Click on the latest deployment
3. Click **"View Function Logs"**
4. Try logging in again
5. Look for `[AUTH]` prefixed messages:

**Success logs:**
```
[AUTH] Credentials authorize: Attempting login { email: "admin@konnecthere.com" }
[AUTH] Credentials authorize: Successful authentication { email: "admin@konnecthere.com", userId: "...", role: "ADMIN" }
```

**Error logs (if login fails):**
```
[AUTH] Credentials authorize: Database connection error { email: "...", error: "..." }
[AUTH] Credentials authorize: User not found { email: "..." }
[AUTH] Credentials authorize: Invalid password { email: "...", userId: "..." }
```

**Common Issues:**
- `Database connection error` → Check `DATABASE_URL` (use direct connection, port 5432)
- `User not found` → Run seed script (Step 3)
- `Invalid password` → User exists but password hash is wrong (re-run seed script)

## 🔒 Security Checklist

- [ ] `AUTH_SECRET` is a strong random string (generated with `openssl rand -base64 32`)
- [ ] `ALLOW_DEBUG` is set to `"false"` in production (or not set at all)
- [ ] Test user passwords are changed in production after verification
- [ ] `DATABASE_URL` uses secure connection (SSL/TLS)
- [ ] Environment variables are not committed to git

## 📝 Post-Deployment

After everything is verified:

1. **Change test user passwords** in production:
   - Log in as admin
   - Go to user management
   - Change passwords for test users

2. **Disable debug endpoints** (if enabled):
   - Set `ALLOW_DEBUG="false"` in Vercel
   - Or remove the variable entirely
   - Redeploy

3. **Monitor logs** for any authentication issues

4. **Document** any custom configuration for your team

## ✅ Final Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations run successfully
- [ ] Production database seeded with test users
- [ ] Application redeployed
- [ ] Debug endpoints show correct configuration
- [ ] All three test users can log in successfully
- [ ] Dashboards load correctly after login
- [ ] Vercel logs show successful authentication
- [ ] Test user passwords changed (after verification)
- [ ] Debug endpoints disabled in production

---

**Once all items are checked, your production authentication is fully configured!** 🎉

