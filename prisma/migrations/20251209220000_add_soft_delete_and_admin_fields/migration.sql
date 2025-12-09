-- AlterEnum: Add INACTIVE to UserStatus
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'INACTIVE';

-- AlterEnum: Add SUPER_ADMIN and MODERATOR to UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MODERATOR';

-- AlterEnum: Add REJECTED to JobStatus
ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- CreateEnum: CompanyStatus
DO $$ BEGIN
 CREATE TYPE "CompanyStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: FlagStatus
DO $$ BEGIN
 CREATE TYPE "FlagStatus" AS ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Add deletedAt and lastLoginAt to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- CreateIndex: Add index on User.deletedAt
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");

-- AlterTable: Add deletedAt to Company
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "status" "CompanyStatus" DEFAULT 'PENDING';

-- CreateIndex: Add index on Company.deletedAt and status
CREATE INDEX IF NOT EXISTS "Company_deletedAt_idx" ON "Company"("deletedAt");
CREATE INDEX IF NOT EXISTS "Company_status_idx" ON "Company"("status");

-- AlterTable: Add deletedAt to Job
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateIndex: Add index on Job.deletedAt
CREATE INDEX IF NOT EXISTS "Job_deletedAt_idx" ON "Job"("deletedAt");

-- AlterTable: Add deletedAt to Application
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateIndex: Add index on Application.deletedAt
CREATE INDEX IF NOT EXISTS "Application_deletedAt_idx" ON "Application"("deletedAt");

-- CreateTable: ApplicationStatusChange
CREATE TABLE IF NOT EXISTS "ApplicationStatusChange" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "oldStatus" "ApplicationStatus",
    "newStatus" "ApplicationStatus" NOT NULL,
    "changedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ApplicationStatusChange indexes
CREATE INDEX IF NOT EXISTS "ApplicationStatusChange_applicationId_idx" ON "ApplicationStatusChange"("applicationId");
CREATE INDEX IF NOT EXISTS "ApplicationStatusChange_changedById_idx" ON "ApplicationStatusChange"("changedById");
CREATE INDEX IF NOT EXISTS "ApplicationStatusChange_createdAt_idx" ON "ApplicationStatusChange"("createdAt");

-- AddForeignKey: ApplicationStatusChange
DO $$ BEGIN
 ALTER TABLE "ApplicationStatusChange" ADD CONSTRAINT "ApplicationStatusChange_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ApplicationStatusChange" ADD CONSTRAINT "ApplicationStatusChange_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable: Skill
CREATE TABLE IF NOT EXISTS "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Skill indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Skill_name_key" ON "Skill"("name");
CREATE INDEX IF NOT EXISTS "Skill_name_idx" ON "Skill"("name");
CREATE INDEX IF NOT EXISTS "Skill_category_idx" ON "Skill"("category");

-- CreateTable: JobRole
CREATE TABLE IF NOT EXISTS "JobRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: JobRole indexes
CREATE UNIQUE INDEX IF NOT EXISTS "JobRole_name_key" ON "JobRole"("name");
CREATE INDEX IF NOT EXISTS "JobRole_name_idx" ON "JobRole"("name");
CREATE INDEX IF NOT EXISTS "JobRole_category_idx" ON "JobRole"("category");

-- CreateTable: Industry
CREATE TABLE IF NOT EXISTS "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Industry indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Industry_name_key" ON "Industry"("name");
CREATE INDEX IF NOT EXISTS "Industry_name_idx" ON "Industry"("name");

-- CreateTable: Location
CREATE TABLE IF NOT EXISTS "Location" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Location indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Location_city_state_country_key" ON "Location"("city", "state", "country");
CREATE INDEX IF NOT EXISTS "Location_city_idx" ON "Location"("city");
CREATE INDEX IF NOT EXISTS "Location_country_idx" ON "Location"("country");

-- CreateTable: AdminActionLog
CREATE TABLE IF NOT EXISTS "AdminActionLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: AdminActionLog indexes
CREATE INDEX IF NOT EXISTS "AdminActionLog_adminId_idx" ON "AdminActionLog"("adminId");
CREATE INDEX IF NOT EXISTS "AdminActionLog_actionType_idx" ON "AdminActionLog"("actionType");
CREATE INDEX IF NOT EXISTS "AdminActionLog_entityType_idx" ON "AdminActionLog"("entityType");
CREATE INDEX IF NOT EXISTS "AdminActionLog_entityId_idx" ON "AdminActionLog"("entityId");
CREATE INDEX IF NOT EXISTS "AdminActionLog_createdAt_idx" ON "AdminActionLog"("createdAt");

-- AddForeignKey: AdminActionLog
DO $$ BEGIN
 ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable: Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetRole" TEXT,
    "targetSegment" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Notification indexes
CREATE INDEX IF NOT EXISTS "Notification_type_idx" ON "Notification"("type");
CREATE INDEX IF NOT EXISTS "Notification_targetRole_idx" ON "Notification"("targetRole");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateTable: NotificationRecipient
CREATE TABLE IF NOT EXISTS "NotificationRecipient" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: NotificationRecipient indexes
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationRecipient_notificationId_userId_key" ON "NotificationRecipient"("notificationId", "userId");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_userId_idx" ON "NotificationRecipient"("userId");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_readAt_idx" ON "NotificationRecipient"("readAt");

-- AddForeignKey: NotificationRecipient
DO $$ BEGIN
 ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable: Setting
CREATE TABLE IF NOT EXISTS "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Setting indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key");
CREATE INDEX IF NOT EXISTS "Setting_key_idx" ON "Setting"("key");
CREATE INDEX IF NOT EXISTS "Setting_category_idx" ON "Setting"("category");

-- CreateTable: Template
CREATE TABLE IF NOT EXISTS "Template" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Template indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Template_type_name_key" ON "Template"("type", "name");
CREATE INDEX IF NOT EXISTS "Template_type_idx" ON "Template"("type");
CREATE INDEX IF NOT EXISTS "Template_isActive_idx" ON "Template"("isActive");

-- CreateTable: FlaggedItem
CREATE TABLE IF NOT EXISTS "FlaggedItem" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'PENDING',
    "flaggedById" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlaggedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: FlaggedItem indexes
CREATE INDEX IF NOT EXISTS "FlaggedItem_entityType_idx" ON "FlaggedItem"("entityType");
CREATE INDEX IF NOT EXISTS "FlaggedItem_entityId_idx" ON "FlaggedItem"("entityId");
CREATE INDEX IF NOT EXISTS "FlaggedItem_status_idx" ON "FlaggedItem"("status");
CREATE INDEX IF NOT EXISTS "FlaggedItem_flaggedById_idx" ON "FlaggedItem"("flaggedById");
CREATE INDEX IF NOT EXISTS "FlaggedItem_createdAt_idx" ON "FlaggedItem"("createdAt");

-- AddForeignKey: FlaggedItem
DO $$ BEGIN
 ALTER TABLE "FlaggedItem" ADD CONSTRAINT "FlaggedItem_flaggedById_fkey" FOREIGN KEY ("flaggedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "FlaggedItem" ADD CONSTRAINT "FlaggedItem_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

