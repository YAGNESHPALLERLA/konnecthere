# AWS IAM Setup Guide - Create User for S3 Access

## ⚠️ Important: Don't Use Root Credentials

**Never use your AWS root account credentials in applications!** Instead, create an IAM user with limited permissions.

## Step-by-Step Guide

### Step 1: Create IAM User

1. Go to AWS Console: https://console.aws.amazon.com
2. Search for "IAM" in the search bar
3. Click **"Users"** in the left sidebar
4. Click **"Create user"** button
5. **User name:** Enter `konnecthere-s3-user` (or any name you prefer)
6. Click **"Next"**

### Step 2: Set Permissions

1. Select **"Attach policies directly"**
2. Search for and select: **"AmazonS3FullAccess"** (or create a custom policy with only S3 permissions)
3. Click **"Next"**
4. Review and click **"Create user"**

### Step 3: Create Access Keys

1. Click on the newly created user
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"** section
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **"Next"**
7. (Optional) Add description: "For KonnectHere resume uploads"
8. Click **"Create access key"**
9. **IMPORTANT:** Copy both:
   - **Access key ID** (starts with `AKIA...`)
   - **Secret access key** (click "Show" to reveal it)
   
   ⚠️ **Save these immediately - you won't be able to see the secret key again!**

### Step 4: Get Your Region

From your S3 bucket, I can see you're using:
- **Region:** `eu-north-1` (Europe - Stockholm)
- **Bucket name:** `konnecthere`

---

## What to Provide

Once you've created the IAM user and access keys, provide me with:

```
AWS Access Key ID: [starts with AKIA...]
AWS Secret Access Key: [the secret key]
AWS Region: eu-north-1
S3 Bucket Name: konnecthere
```

I'll then update your `.env` file with these credentials.

---

## Quick Reference

- **Region:** `eu-north-1` (Europe - Stockholm) ✅
- **Bucket Name:** `konnecthere` ✅
- **Access Key ID:** [Get from IAM user]
- **Secret Access Key:** [Get from IAM user]






