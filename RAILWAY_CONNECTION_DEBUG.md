# Railway Connection Debugging

## Current Connection String

```
postgresql://postgres:gAWQQuZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway
```

## Possible Issues & Solutions

### Issue 1: Database Name Might Be Wrong

Railway might use `postgres` as the database name, not `railway`. Try:

```bash
DATABASE_URL="postgresql://postgres:gAWQQuZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/postgres" npm run db:test
```

### Issue 2: Need SSL Parameter

Railway might require SSL. Try:

```bash
DATABASE_URL="postgresql://postgres:gAWQQuZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway?sslmode=require" npm run db:test
```

### Issue 3: Password Case Sensitivity

PostgreSQL passwords are case-sensitive. Make sure:
- No extra spaces
- Exact case for each letter
- No special characters are escaped incorrectly

### Issue 4: Railway Database Not Fully Initialized

1. Go to Railway Dashboard → Postgres → **"Logs"** tab
2. Check if you see any initialization errors
3. Wait 2-3 minutes if database was just created
4. Try restarting the service: Settings → Danger → Restart Service

### Issue 5: Check Railway Variables Again

1. Go to Railway → Postgres → **"Variables"** tab
2. Look for these variables:
   - `DATABASE_PUBLIC_URL` - Use this for external connections
   - `PGPASSWORD` - Check if password matches
   - `POSTGRES_PASSWORD` - Check if password matches
3. Make sure you're copying `DATABASE_PUBLIC_URL`, not typing it

### Issue 6: URL Encoding Issues

If password has special characters, they might need URL encoding. Try copying the connection string directly from Railway without any modifications.

## Test Commands to Try

```bash
# Test 1: With 'postgres' database
DATABASE_URL="postgresql://postgres:gAWQQuZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/postgres" npm run db:test

# Test 2: With SSL
DATABASE_URL="postgresql://postgres:gAWQQuZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/railway?sslmode=require" npm run db:test

# Test 3: With 'postgres' database and SSL
DATABASE_URL="postgresql://postgres:gAWQQuZOXjpJZFHSEhnewEoZyLWcmjHm@centerbeam.proxy.rlwy.net:36810/postgres?sslmode=require" npm run db:test
```

## Check Railway Database Status

1. **Go to Railway Dashboard** → Postgres
2. **Check "Logs" tab** - Look for:
   - "database system is ready to accept connections"
   - Any error messages
   - Initialization status

3. **Check "Metrics" tab** - Verify:
   - Database is running
   - No errors

4. **Restart if needed**:
   - Settings → Danger → Restart Service
   - Wait 1-2 minutes
   - Try connection again

## Alternative: Check Railway Connection String Format

In Railway → Postgres → Variables, check:
- Is `DATABASE_PUBLIC_URL` the exact format you're using?
- Does it include `?sslmode=require` or other parameters?
- Is the database name `railway` or `postgres`?

## If Nothing Works

1. **Delete and recreate Railway database**:
   - Delete current Postgres service
   - Create new PostgreSQL database
   - Get new connection string
   - Try again

2. **Use Railway's connection test**:
   - Railway might have a "Test Connection" button
   - Use that to verify the connection string works

3. **Check Railway documentation**:
   - Railway docs might have specific connection requirements
   - Check if there are any special settings needed

---

**Try the test commands above - most likely the database name should be 'postgres' not 'railway'!**

