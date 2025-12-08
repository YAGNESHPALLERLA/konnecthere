# Setup Railway Database - Multiple Methods

Since Railway doesn't have a built-in SQL editor, here are 3 ways to set up your database:

## Method 1: Use Prisma Migrations (RECOMMENDED - Easiest)

This is the cleanest way using Prisma's migration system:

### Step 1: Get your Railway DATABASE_URL

1. In Railway → Your Postgres Service → **Variables** tab
2. Copy the `DATABASE_PUBLIC_URL` or `DATABASE_URL` value

### Step 2: Run migrations locally

Open your terminal and run:

```bash
# Set the production DATABASE_URL
export DATABASE_URL="your-railway-database-url-here"

# Apply all migrations (creates all tables)
npx prisma migrate deploy

# Seed the database with test users
npm run db:seed
```

This will:
- ✅ Create all tables
- ✅ Add all indexes and foreign keys
- ✅ Add the new profile fields
- ✅ Create 3 test users

## Method 2: Use psql (PostgreSQL Command Line)

### Step 1: Install psql (if not already installed)

**On macOS:**
```bash
brew install postgresql
```

**On Linux:**
```bash
sudo apt-get install postgresql-client
```

**On Windows:**
Download from: https://www.postgresql.org/download/windows/

### Step 2: Connect to Railway database

1. Get your Railway connection string from Railway → Variables tab
2. Run:

```bash
psql "your-railway-database-url-here"
```

### Step 3: Run the SQL script

Once connected, you can either:

**Option A: Copy-paste the SQL file**
```bash
# In your terminal (not in psql)
cat RAILWAY_COMPLETE_SETUP.sql | psql "your-railway-database-url-here"
```

**Option B: Run it interactively**
```bash
# Connect first
psql "your-railway-database-url-here"

# Then copy-paste the contents of RAILWAY_COMPLETE_SETUP.sql
# Or use \i command if you uploaded the file
\i /path/to/RAILWAY_COMPLETE_SETUP.sql
```

## Method 3: Use a Database GUI Tool

### Option A: DBeaver (Free, Cross-platform)

1. **Download DBeaver**: https://dbeaver.io/download/
2. **Install and open DBeaver**
3. **Create new connection**:
   - Click "New Database Connection"
   - Select "PostgreSQL"
   - Enter your Railway connection details:
     - Host: `turntable.proxy.rlwy.net` (from your connection string)
     - Port: `44067`
     - Database: `railway`
     - Username: `postgres`
     - Password: `OnxBgOTkXElhyKBBWJWCYDmvFmKXwZPn`
4. **Connect**
5. **Open SQL Editor**: Right-click on your database → SQL Editor → New SQL Script
6. **Copy-paste** the contents of `RAILWAY_COMPLETE_SETUP.sql`
7. **Execute** (Ctrl+Enter or Cmd+Enter)

### Option B: TablePlus (macOS/Windows)

1. **Download TablePlus**: https://tableplus.com/
2. **Create new connection** → PostgreSQL
3. **Enter Railway connection details**
4. **Open SQL Editor** (Cmd+T or Ctrl+T)
5. **Paste and run** the SQL script

### Option C: pgAdmin (Free, Cross-platform)

1. **Download pgAdmin**: https://www.pgadmin.org/download/
2. **Add new server** with Railway connection details
3. **Open Query Tool**
4. **Paste and execute** the SQL script

## Quick One-Liner (Method 1 - Recommended)

If you have the DATABASE_URL, just run:

```bash
DATABASE_URL="postgresql://postgres:OnxBgOTkXElhyKBBWJWCYDmvFmKXwZPn@turntable.proxy.rlwy.net:44067/railway" npx prisma migrate deploy && DATABASE_URL="postgresql://postgres:OnxBgOTkXElhyKBBWJWCYDmvFmKXwZPn@turntable.proxy.rlwy.net:44067/railway" npm run db:seed
```

Replace the DATABASE_URL with your actual Railway connection string if different.

## Verify Setup

After running any method, verify in Railway:

1. Go to Railway → Database → Data tab
2. Click on the **User** table
3. You should see 3 users:
   - admin@konnecthere.com
   - hr@konnecthere.com
   - user@konnecthere.com

## Test Login

Go to https://konnecthere.com/auth/signin and try:
- **Admin**: admin@konnecthere.com / admin123
- **HR**: hr@konnecthere.com / hr123
- **User**: user@konnecthere.com / user123

