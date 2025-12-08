# Railway Connection Troubleshooting

## Current Issue

Connection test shows: `Can't reach database server at 'centerbeam.proxy.rlwy.net:36810'`

## Possible Causes & Fixes

### 1. Add SSL Parameter

Railway databases might require SSL. Try adding `?sslmode=require`:

```bash
DATABASE_URL="postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway?sslmode=require" npm run db:test
```

### 2. Check Railway Database Status

1. Go to Railway Dashboard
2. Check if Postgres service shows **"Online"** (green dot)
3. If it shows "Offline" or error, restart the service

### 3. Verify Connection String Format

Make sure the connection string is exactly:
```
postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway
```

**Common mistakes:**
- ❌ Missing `postgresql://` prefix
- ❌ Wrong password
- ❌ Wrong host/port
- ❌ Missing database name (`railway`)

### 4. Check Railway Public Networking

1. In Railway Dashboard → Postgres → Settings → Networking
2. Verify **"Public Networking"** is enabled
3. The endpoint should be: `centerbeam.proxy.rlwy.net:36810`
4. If it's different, use the exact endpoint shown

### 5. Try Different Connection String Formats

**Format 1 (with SSL):**
```
postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway?sslmode=require
```

**Format 2 (with schema):**
```
postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway?schema=public&sslmode=require
```

**Format 3 (simple, no SSL):**
```
postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway
```

### 6. Check Railway Variables

1. Go to Railway Dashboard → Postgres → Variables
2. Verify `DATABASE_PUBLIC_URL` matches what you're using
3. Copy the exact value from Railway (don't type it manually)

### 7. Restart Railway Database

If nothing works:
1. Go to Railway Dashboard → Postgres
2. Click **"Settings"** → **"Danger"** section
3. Click **"Restart Service"**
4. Wait 1-2 minutes
5. Try connection again

### 8. Check Railway Logs

1. Go to Railway Dashboard → Postgres → **"Logs"** tab
2. Look for any error messages
3. Check if database is actually running

## Quick Test Commands

```bash
# Test 1: With SSL
DATABASE_URL="postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway?sslmode=require" npm run db:test

# Test 2: Without SSL
DATABASE_URL="postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway" npm run db:test

# Test 3: Direct connection test
psql "postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway" -c "SELECT version();"
```

## Alternative: Use Internal Connection (For Railway Services)

If you're deploying on Railway itself (not Vercel), use the internal connection:
```
postgresql://postgres:gAWQQUZOXjpJZFHSEhnewEoZyLWcmjHm@postgres.railway.internal:5432/railway
```

But for **Vercel**, you MUST use the public endpoint.

## Next Steps

1. **Try adding SSL parameter** first
2. **Verify Railway database is Online**
3. **Copy exact connection string from Railway Variables**
4. **Check Railway logs** for errors
5. **Restart Railway database** if needed

---

**Most likely fix: Add `?sslmode=require` to the connection string!**

