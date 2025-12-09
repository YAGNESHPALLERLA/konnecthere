# Apply Migration to Railway Production Database

## Option 1: Using Environment Variable (Recommended)

1. **Get your Railway database URL:**
   - Go to [Railway Dashboard](https://railway.app)
   - Select your project
   - Click on your PostgreSQL service
   - Go to the "Variables" tab
   - Copy the `DATABASE_URL` value

2. **Set the environment variable and run:**
   ```bash
   export DATABASE_URL='your-railway-database-url-here'
   npx prisma db execute --file prisma/migrations/apply_admin_fields.sql --schema prisma/schema.prisma
   ```

3. **Or use the helper script:**
   ```bash
   export DATABASE_URL='your-railway-database-url-here'
   ./apply_migration_to_production.sh
   ```

## Option 2: Using Railway CLI

If you have Railway CLI installed:

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Get database URL
railway variables

# Set DATABASE_URL and run migration
export DATABASE_URL=$(railway variables --json | jq -r '.DATABASE_URL')
npx prisma db execute --file prisma/migrations/apply_admin_fields.sql --schema prisma/schema.prisma
```

## Option 3: Direct SQL Execution via Railway Dashboard

1. Go to Railway Dashboard → Your Project → PostgreSQL Service
2. Click on "Query" or "Data" tab
3. Copy the entire contents of `prisma/migrations/apply_admin_fields.sql`
4. Paste and execute in the SQL editor

## Option 4: Using psql (if you have direct access)

```bash
# Connect to Railway database
psql $DATABASE_URL

# Then run:
\i prisma/migrations/apply_admin_fields.sql
```

## After Migration

1. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Verify the migration:**
   - Visit https://konnecthere.com/admin
   - Check that all admin pages load without errors
   - Test user management, company management, etc.

## Important Notes

- ✅ The migration script is **idempotent** - safe to run multiple times
- ✅ It checks if columns/tables exist before creating them
- ✅ Existing data will be preserved
- ✅ The script will set existing companies' status based on their `verified` field

## Troubleshooting

If you encounter errors:

1. **Check database connection:**
   ```bash
   npx prisma db execute --stdin --schema prisma/schema.prisma <<< "SELECT 1;"
   ```

2. **Check if columns already exist:**
   ```bash
   npx prisma db execute --stdin --schema prisma/schema.prisma <<< "SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name IN ('deletedAt', 'lastLoginAt');"
   ```

3. **View migration errors:**
   - Check the error message carefully
   - Most errors are handled gracefully (duplicate objects are skipped)
   - If a specific step fails, you can run individual SQL statements

