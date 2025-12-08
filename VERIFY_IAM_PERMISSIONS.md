# Verify IAM User Permissions

## Check IAM User Has Correct Permissions

### Step 1: Verify Policy is Attached

1. **Go to AWS Console** → **IAM** → **Users**
2. **Click on `konnecthere-s3-user`**
3. **Click "Permissions" tab**
4. **You should see:** `AmazonS3FullAccess` listed under "Permissions policies"

### Step 2: If Policy is Missing

1. **Click "Add permissions"**
2. **Select "Attach policies directly"**
3. **Search for:** `AmazonS3FullAccess`
4. **Check the box** next to it
5. **Click "Next"** → **"Add permissions"**

### Step 3: Verify Policy Details

The `AmazonS3FullAccess` policy should allow:
- `s3:*` (all S3 actions)
- On resource: `*` (all buckets and objects)

## Alternative: Create Custom Policy (More Secure)

If you want more restrictive permissions, create a custom policy:

1. **Go to IAM** → **Policies** → **"Create policy"**
2. **Click "JSON" tab**
3. **Paste this:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::konnecthere/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::konnecthere"
    }
  ]
}
```

4. **Name it:** `KonnectHereS3Upload`
5. **Create policy**
6. **Attach it to `konnecthere-s3-user`**

## Verify Access Key is Active

1. **Go to IAM** → **Users** → **`konnecthere-s3-user`**
2. **Click "Security credentials" tab**
3. **Under "Access keys"**, verify:
   - Status is **"Active"**
   - The access key matches what's in Vercel

## Test IAM Permissions

You can test if the IAM user can access S3:

1. **Go to AWS Console** → **S3** → **`konnecthere`** bucket
2. **Try uploading a test file manually**
3. **If it works**, IAM permissions are correct
4. **If it fails**, IAM user needs more permissions

