# Supabase Connection Setup

## ✅ Your .env file is created with:
- ✅ Database URL (your Supabase connection)
- ✅ NextAuth Secret (generated)
- ✅ NextAuth URLs

## ⚠️ Database Connection Issue

The connection string might need adjustment. Here's how to get the correct one:

### Step 1: Get Correct Connection String from Supabase

1. Go to: https://supabase.com/dashboard/project/toluzrymeoossrfbwpve
2. Click **Settings** (gear icon) → **Database**
3. Scroll to **Connection string** section
4. You'll see multiple options:

   **Option A: URI (Recommended for Prisma)**
   - Copy the "URI" connection string
   - It should look like:
     ```
     postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```

   **Option B: Direct connection**
   - Copy the "Direct connection" string
   - It should look like:
     ```
     postgresql://postgres:[password]@db.toluzrymeoossrfbwpve.supabase.co:5432/postgres
     ```

### Step 2: Update .env File

Replace the `DATABASE_URL` in your `.env` file with the connection string from Supabase dashboard.

**Important:** 
- If your password contains special characters, they might need URL encoding
- Use the "URI" connection string (with pooler) for better performance
- Make sure your IP is allowed in Supabase (Settings → Database → Connection pooling)

### Step 3: Test Connection

```bash
# Test if connection works
npm run db:migrate
```

### Step 4: If Connection Still Fails

**Check these:**
1. **IP Allowlist:** Supabase → Settings → Database → Connection pooling → Check if your IP needs to be added
2. **Password Encoding:** Special characters in password might need URL encoding
3. **Network:** Make sure you can reach Supabase servers

### Alternative: Use Connection Pooler (Recommended)

In Supabase dashboard:
1. Go to Settings → Database
2. Find "Connection pooling" section
3. Copy the "Session mode" or "Transaction mode" connection string
4. Use that in your `.env` file

---

## Current Status

✅ `.env` file created
✅ NextAuth secret generated
✅ Prisma client generated
⏳ Database migration pending (connection issue)

Once you update the `DATABASE_URL` with the correct connection string from Supabase dashboard, run:

```bash
npm run db:migrate
npm run dev
```






