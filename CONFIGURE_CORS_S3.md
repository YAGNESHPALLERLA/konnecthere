# Configure CORS on Your S3 Bucket

## Step-by-Step Instructions

1. **Go to your S3 bucket:**
   - In AWS Console, go to **S3** → Click on your bucket **`konnecthere`**

2. **Open Permissions tab:**
   - Click on the **"Permissions"** tab

3. **Scroll to CORS section:**
   - Scroll down to **"Cross-origin resource sharing (CORS)"**
   - Click **"Edit"**

4. **Paste this CORS configuration:**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": [
      "https://konnecthere.com",
      "https://www.konnecthere.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. **Click "Save changes"**

## Why This is Important

Without CORS, your browser will block the upload request to S3, causing "Failed to fetch" errors.

