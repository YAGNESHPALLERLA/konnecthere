# Database Migration Guide

## Migration: Add Soft Delete and Admin Fields

This migration adds the following fields and tables to support the admin portal:

### Fields Added:
- `User.deletedAt` - Soft delete for users
- `User.lastLoginAt` - Track last login time
- `Company.deletedAt` - Soft delete for companies
- `Company.status` - CompanyStatus enum (PENDING, APPROVED, REJECTED, SUSPENDED)
- `Job.deletedAt` - Soft delete for jobs
- `Application.deletedAt` - Soft delete for applications

### Enums Added/Updated:
- `UserStatus`: Added INACTIVE
- `UserRole`: Added SUPER_ADMIN, MODERATOR
- `JobStatus`: Added REJECTED
- `CompanyStatus`: New enum (PENDING, APPROVED, REJECTED, SUSPENDED)
- `FlagStatus`: New enum (PENDING, REVIEWED, RESOLVED, DISMISSED)

### New Tables:
- `ApplicationStatusChange` - Track application status history
- `Skill` - Skills management
- `JobRole` - Job roles management
- `Industry` - Industries management
- `Location` - Locations management
- `AdminActionLog` - Audit trail for admin actions
- `Notification` - System notifications
- `NotificationRecipient` - Notification recipients
- `Setting` - Platform settings
- `Template` - Email/SMS templates
- `FlaggedItem` - Content moderation flags

## How to Apply Migration

### Option 1: Using Prisma Migrate (Recommended)

```bash
# Apply the migration
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

### Option 2: Manual SQL Execution

If you have database access, you can run the SQL file directly:

```bash
# Connect to your database and run:
psql $DATABASE_URL -f prisma/migrations/20251209220000_add_soft_delete_and_admin_fields/migration.sql
```

### Option 3: Using Railway/Production Database

If using Railway or similar:

1. Connect to your database
2. Run the migration SQL file manually
3. Mark migration as applied:
   ```bash
   npx prisma migrate resolve --applied 20251209220000_add_soft_delete_and_admin_fields
   ```

## After Migration

1. Regenerate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Verify the migration:
   ```bash
   npx prisma migrate status
   ```

3. Test the admin portal:
   - Visit `/admin`
   - Check `/admin/users` - should show users without errors
   - Check `/admin/hr` - should show companies with status

## Rollback (if needed)

If you need to rollback, you can manually remove the columns:

```sql
-- Remove deletedAt columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lastLoginAt";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Job" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "Application" DROP COLUMN IF EXISTS "deletedAt";

-- Drop new tables (if needed)
DROP TABLE IF EXISTS "ApplicationStatusChange";
DROP TABLE IF EXISTS "Skill";
DROP TABLE IF EXISTS "JobRole";
DROP TABLE IF EXISTS "Industry";
DROP TABLE IF EXISTS "Location";
DROP TABLE IF EXISTS "AdminActionLog";
DROP TABLE IF EXISTS "Notification";
DROP TABLE IF EXISTS "NotificationRecipient";
DROP TABLE IF EXISTS "Setting";
DROP TABLE IF EXISTS "Template";
DROP TABLE IF EXISTS "FlaggedItem";
```

