# How to Seed Production Database

## Step-by-Step Instructions

### Step 1: Open Your Terminal

Open a terminal on your local machine (where you have the konnecthere project).

### Step 2: Navigate to Project Directory

```bash
cd /path/to/konnecthere
# Or if you're already in the project:
cd ~/konnecthere
```

### Step 3: Test Database Connection First (Optional but Recommended)

Before seeding, let's make sure the connection works:

```bash
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma db pull
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.vstltyehsgjtcvcxphoh.supabase.co:5432"

✔ Introspected 15 models and wrote them into prisma/schema.prisma in XXXms
```

If you see an error, the DATABASE_URL might be wrong. Double-check it.

### Step 4: Run Database Migrations (If Needed)

Make sure your database schema is up to date:

```bash
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma migrate deploy
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.vstltyehsgjtcvcxphoh.supabase.co:5432"

X migrations already applied to database.
```

### Step 5: Seed the Database

Now run the seed script:

```bash
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npm run db:seed
```

**OR** you can use:

```bash
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma db seed
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

⚠️  Remember to change these passwords in production!
```

### Step 6: Verify Users Were Created

You can verify by checking the debug endpoint (if ALLOW_DEBUG=true is set in Vercel):

Visit: `https://www.konnecthere.com/api/debug/users`

**Expected response:**
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

## Alternative: Using Environment Variable

If you prefer, you can set the DATABASE_URL as an environment variable first:

```bash
# Set the environment variable
export DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres"

# Then run commands without the DATABASE_URL prefix
npx prisma migrate deploy
npm run db:seed
```

## Troubleshooting

### Error: "Can't reach database server"

**Solution**: Check your DATABASE_URL. Make sure:
- You're using port `5432` (not `6543`)
- Host is `db.vstltyehsgjtcvcxphoh.supabase.co` (not pooler URL)
- Username is `postgres` (not `postgres.vstltyehsgjtcvcxphoh`)

### Error: "Authentication failed"

**Solution**: Check your password. It should be `yagnesh_0504` (from your Vercel config).

### Error: "relation does not exist"

**Solution**: Run migrations first:
```bash
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma migrate deploy
```

### Error: "Module not found" or "Command not found"

**Solution**: Make sure you're in the project directory and dependencies are installed:
```bash
cd /path/to/konnecthere
npm install
```

## Quick Copy-Paste Commands

Here are the commands you can copy-paste directly:

```bash
# Test connection
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma db pull

# Run migrations
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npx prisma migrate deploy

# Seed database
DATABASE_URL="postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres" npm run db:seed
```

## What the Seed Script Does

The seed script (`prisma/seed.ts`) creates:

1. **Admin User**
   - Email: `admin@konnecthere.com`
   - Password: `admin123`
   - Role: `ADMIN`

2. **HR User**
   - Email: `hr@konnecthere.com`
   - Password: `hr123`
   - Role: `HR`
   - Also creates a sample company for HR to manage

3. **Regular User**
   - Email: `user@konnecthere.com`
   - Password: `user123`
   - Role: `USER`

All passwords are hashed using bcrypt before being stored in the database.

---

**After seeding, try logging in at `https://www.konnecthere.com/auth/signin` with one of these accounts!**

