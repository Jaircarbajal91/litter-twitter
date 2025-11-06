# AWS S3 Image Upload Setup Guide

Complete step-by-step guide for setting up AWS S3 image uploads from scratch in your Litter Twitter application.

---

## Overview

This guide will walk you through:
1. Creating an S3 bucket
2. Configuring bucket permissions and CORS
3. Creating an IAM user with proper permissions
4. Generating access keys
5. Setting up environment variables
6. Testing the setup

**What you'll need:**
- AWS Account (free tier is fine)
- Python environment with `boto3` (already in `requirements.txt`)

---

## Step 1: Create an S3 Bucket

### 1.1 Navigate to S3

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Search for **"S3"** in the top search bar
3. Click on **S3** service

### 1.2 Create the Bucket

1. Click the orange **"Create bucket"** button
2. **General configuration:**
   - **Bucket name**: Enter `litter-twitter` (or any unique name - S3 bucket names are globally unique)
   - **AWS Region**: Choose a region close to you (e.g., `US West (N. California) us-west-1` or `US West (Oregon) us-west-2`)
3. **Object Ownership**:
   - Select: **ACLs disabled (recommended)** ✅
   - This ensures all objects are owned by your account and access is controlled via bucket policies (more secure)
4. **Block Public Access settings for this bucket**:
   - **CHECK** "Block all public access" (this enables all four settings below)
   - **Configure as follows:**
     - ☑ Block all public access
     - ☑ Block public access to buckets and objects granted through new access control lists (ACLs)
     - ☑ Block public access to buckets and objects granted through any access control lists (ACLs)
     - ☐ **UNCHECK**: Block public access to buckets and objects granted through new public bucket or access point policies
     - ☐ **UNCHECK**: Block public and cross-account access to buckets and objects through any public bucket or access point policies
   - **Note**: We're unchecking the last two settings to allow bucket policies to grant public read access. This keeps ACL-based public access blocked while allowing policy-based access (more secure).
5. **Bucket Versioning**: Leave as **"Disable"** (optional)
6. **Default encryption**: 
   - Leave as default: **Server-side encryption with Amazon S3 managed keys (SSE-S3)** ✅
   - This provides free encryption for all objects
   - Bucket Key: Can be left as **"Enable"** (reduces costs if you later use SSE-KMS)
7. Click **"Create bucket"** at the bottom

> **Important**: Even though we're enabling "Block all public access", the bucket policy we'll add in Step 2.1 will override this to allow public read access for images. This is the recommended security practice.

---

## Step 2: Configure Bucket Permissions

### 2.1 Set Up Bucket Policy (Public Read Access)

**Important**: Even though "Block all public access" is enabled, a bucket policy can override this to allow public read access. However, AWS requires you to acknowledge this override.

1. Click on your newly created bucket (`litter-twitter-2`)
2. Go to the **"Permissions"** tab
3. Scroll down to **"Bucket policy"**
4. Click **"Edit"**
5. Paste this policy (replace `litter-twitter-2` with your bucket name if different):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::litter-twitter-2/*"
        }
    ]
}
```

6. If you see an error about Block Public Access settings conflicting, ensure you've unchecked the last TWO settings in Step 1.4:
   - "Block public access to buckets and objects granted through new public bucket or access point policies"
   - "Block public and cross-account access to buckets and objects through any public bucket or access point policies"
7. Click **"Save changes"** - the bucket policy should save successfully
8. The bucket policy will now allow public read access for images while keeping ACL-based public access blocked

### 2.2 Configure CORS (Cross-Origin Resource Sharing)

1. Still in the **"Permissions"** tab
2. Scroll down to **"Cross-origin resource sharing (CORS)"**
3. Click **"Edit"**
4. Paste this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

5. Click **"Save changes"**

> **Production Note**: For production, replace `"AllowedOrigins": ["*"]` with your specific domain(s) like `["https://yourdomain.com", "https://www.yourdomain.com"]`

---

## Step 3: Create an IAM User for S3 Access

### 3.1 Navigate to IAM

1. In AWS Console, search for **"IAM"** in the top search bar
2. Click on **IAM** service
3. Click **"Users"** in the left sidebar
4. Click **"Create user"** button

### 3.2 Create the User

1. **User name**: Enter `litter-twitter-s3-user` (or any descriptive name)
2. Click **"Next"**

### 3.3 Create a Custom Policy

1. Under **"Set permissions"**, select **"Attach policies directly"**
2. Click **"Create policy"** button (this opens a new tab/window)
3. In the new window:
   - Click the **"JSON"** tab
   - Delete the default content
   - Paste this policy (replace `litter-twitter` with your bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::litter-twitter/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::litter-twitter"
        }
    ]
}
```

> **Note**: Since we're using "ACLs disabled", we don't need `s3:PutObjectAcl` permission. Access is controlled via bucket policies instead.

4. Click **"Next"**
5. **Policy name**: Enter `S3ImageUploadPolicy`
6. **Description** (optional): "Allows upload, read, and delete access to litter-twitter S3 bucket"
7. Click **"Create policy"**

### 3.4 Attach Policy to User

1. Go back to the **IAM Users** tab (or refresh the page)
2. You should still be on the "Create user" page
3. Click the refresh icon (↻) next to **"Permissions"**
4. In the search box, type `S3ImageUploadPolicy`
5. Check the box next to your new policy
6. Click **"Next"**
7. Review the user details and click **"Create user"**

---

## Step 4: Generate Access Keys

### 4.1 Create Access Keys

1. Click on the user you just created (`litter-twitter-s3-user`)
2. Go to the **"Security credentials"** tab
3. Scroll down to **"Access keys"** section
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **"Next"**
7. **Description** (optional): "For Litter Twitter S3 image uploads"
8. Click **"Create access key"**

### 4.2 Save Your Credentials

**⚠️ IMPORTANT**: You can only see the secret key once!

1. **Access key ID**: Copy this value - this is your `S3_KEY`
2. **Secret access key**: Click **"Show"** and copy this value - this is your `S3_SECRET`
3. Save both values securely (password manager, notes app, etc.)
4. Click **"Done"**

> **Security Tip**: Never commit these keys to version control. If you lose the secret key, you'll need to create a new one.

---

## Step 5: Set Environment Variables

### 5.1 Create `.env` File

In your project root directory, create or update a `.env` file:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///dev.db

# AWS S3 Configuration
S3_BUCKET=litter-twitter
S3_KEY=your-access-key-id-from-step-4
S3_SECRET=your-secret-access-key-from-step-4
```

**Replace:**
- `your-secret-key-here` - Your Flask secret key (if you have one)
- `litter-twitter` - Your actual bucket name
- `your-access-key-id-from-step-4` - The Access key ID you copied
- `your-secret-access-key-from-step-4` - The Secret access key you copied

### 5.2 Verify `.env` File Location

Make sure your `.env` file is in the project root:
```
litter-twitter/
├── .env                    ← Should be here
├── app/
├── react-app/
├── requirements.txt
└── ...
```

### 5.3 Production Setup (Heroku)

If deploying to Heroku, set these config vars:

**Via Command Line:**
```bash
heroku config:set S3_BUCKET=litter-twitter
heroku config:set S3_KEY=your-access-key-id
heroku config:set S3_SECRET=your-secret-access-key
```

**Via Heroku Dashboard:**
1. Go to your Heroku app
2. Click **"Settings"** tab
3. Click **"Reveal Config Vars"**
4. Add each variable:
   - `S3_BUCKET` = `litter-twitter`
   - `S3_KEY` = your access key ID
   - `S3_SECRET` = your secret access key

---

## Step 6: Verify Dependencies

The required packages should already be in your `requirements.txt`:

```txt
boto3==1.37.1
awscli==1.37.1
```

**If you need to install:**
```bash
pipenv install boto3
```

---

## Step 7: Test the Setup

### 7.1 Start Your Servers

**Backend (Terminal 1):**
```bash
pipenv shell
flask run
```

**Frontend (Terminal 2):**
```bash
cd react-app
npm start
```

### 7.2 Test Image Upload

1. Open your app in browser (usually `http://localhost:3000`)
2. Log in to your account
3. Create a new tweet:
   - Click **"Add Image"** button
   - Select an image file (png, jpg, jpeg, or gif)
   - You should see a preview of the image
   - Type some content
   - Click **"Meow"** to submit
4. **Verify the image appears** in your tweet

### 7.3 Verify in S3 Console

1. Go back to AWS S3 Console
2. Click on your `litter-twitter` bucket
3. You should see a new file with a UUID name (e.g., `a1b2c3d4e5f6789.jpg`)
4. Click on the file to see its details
5. Copy the **Object URL** and paste it in a new browser tab - the image should display

---

## How It Works

### Backend Flow

**Upload Process:**
1. User submits a tweet/comment with an image
2. Frontend sends `FormData` to `POST /api/images/`
3. Backend (`app/api/image_routes.py`):
   - Validates file type (png, jpg, jpeg, gif, pdf)
   - Generates unique filename using UUID
   - Uploads to S3 bucket via `boto3`
   - Saves image record to database with URL and metadata
   - Returns S3 URL to frontend

**Delete Process:**
1. User deletes an image
2. Frontend sends request to `DELETE /api/images/`
3. Backend:
   - Deletes file from S3 bucket
   - Removes image record from database
   - Verifies user owns the image

### Frontend Flow

1. **Image Selection**: User clicks file input → `FileReader` creates preview
2. **Upload**: After tweet/comment creation → sends image to backend
3. **Display**: Images rendered using S3 URLs stored in database

### File Structure

```
app/
  ├── api/
  │   ├── image_routes.py          # API endpoints for upload/delete
  │   └── s3_image_upload.py        # S3 upload helper functions
  ├── models/
  │   └── images.py                 # Image database model
  └── config.py                     # Environment variable loading

react-app/src/
  ├── components/
  │   ├── NewTweetForm/             # Image upload in tweets
  │   ├── NewCommentForm/           # Image upload in comments
  │   └── UpdateTweetForm/          # Image replacement
  └── utils/
      └── DeleteImage.js            # Image deletion helper
```

---

## Troubleshooting

### "Access Denied" Errors

**Check:**
- IAM user has the custom policy attached
- Bucket policy allows public read access (even with "Block all public access" enabled, the bucket policy should work)
- Object Ownership is set to "ACLs disabled"
- Access keys are correct in `.env` file
- Bucket name matches exactly (case-sensitive)

### Images Not Displaying

**Check:**
- Bucket policy allows public read access (even if "Block all public access" is enabled, the policy should override it)
- Object Ownership is set to "ACLs disabled"
- CORS configuration is set correctly
- Browser console for CORS errors
- S3 URL works when pasted directly in browser
- Database has correct URL stored

### Upload Fails Silently

**Check:**
- Flask server logs for detailed errors
- All three environment variables are set: `S3_BUCKET`, `S3_KEY`, `S3_SECRET`
- File size isn't too large (S3 limit is 5GB, but consider client-side limits)
- File type is allowed (png, jpg, jpeg, gif, pdf)

### "No module named 'boto3'"

**Solution:**
```bash
pipenv install boto3
```

### Environment Variables Not Loading

**Check:**
- `.env` file is in project root (not in `app/` folder)
- Variable names are exact: `S3_BUCKET`, `S3_KEY`, `S3_SECRET`
- No extra spaces or quotes around values
- Restart Flask server after changing `.env`

---

## Security Best Practices

1. **Never commit `.env` file** to version control (add to `.gitignore`)
2. **Rotate access keys** periodically (every 90 days recommended)
3. **Use IAM policies** with minimal required permissions (already done)
4. **Keep "Block all public access" enabled** - use bucket policies for controlled public access (already configured)
5. **Use "ACLs disabled"** for Object Ownership - more secure and recommended by AWS
6. **Consider file size limits** (currently unlimited - you may want to add validation)
7. **Add MIME type validation** in addition to extension checking
8. **Implement rate limiting** to prevent abuse
9. **Restrict CORS origins** in production (replace `*` with your domain)

---

## Supported File Types

Currently allowed file extensions (defined in `app/api/s3_image_upload.py`):
- `.png`
- `.jpg`
- `.jpeg`
- `.gif`
- `.pdf`

To add more types, update `ALLOWED_EXTENSIONS` in `app/api/s3_image_upload.py`.

---

## Cost Information

- **Storage**: ~$0.023 per GB/month
- **Requests**: Minimal cost for typical usage
- **Free Tier**: 5GB storage, 20,000 GET requests, 2,000 PUT requests per month for 12 months

**Cost Optimization Tips:**
- Set up lifecycle policies to delete old images
- Enable S3 Intelligent-Tiering for automatic cost savings
- Use CloudFront CDN if you have high traffic

---

## Production Checklist

Before deploying to production:

- [ ] S3 bucket created and configured
- [ ] Bucket policy allows public reads
- [ ] CORS configured for your production domain
- [ ] IAM user created with minimal permissions
- [ ] Access keys generated and saved securely
- [ ] Environment variables set in production platform
- [ ] Test upload and delete functionality
- [ ] Verify images display correctly
- [ ] Monitor AWS costs (optional)
- [ ] Set up CloudWatch alarms for unusual activity (optional)

---

## Quick Reference

**Environment Variables:**
```env
S3_BUCKET=litter-twitter
S3_KEY=your-access-key-id
S3_SECRET=your-secret-access-key
```

**Key Files:**
- `app/api/image_routes.py` - Upload/delete endpoints
- `app/api/s3_image_upload.py` - S3 helper functions
- `app/models/images.py` - Database model

**Test Command:**
```bash
# Start backend
pipenv shell
flask run

# Start frontend (new terminal)
cd react-app
npm start
```

---

## You're All Set! 🎉

Once you've completed all steps above, your image upload functionality should be working. Users can now:
- ✅ Upload images with tweets
- ✅ Upload images with comments  
- ✅ Preview images before posting
- ✅ Delete images from tweets/comments
- ✅ View images from S3 URLs

If you run into any issues, check the Troubleshooting section above.
