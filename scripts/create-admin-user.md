# Create Admin User in Firebase

Since you're using Firebase Authentication, you need to create admin users in Firebase Console.

## Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **e-cat-master**
3. Click on **Authentication** in the left sidebar
4. Click on **Users** tab
5. Click **Add User** button
6. Enter:
   - **Email**: Your admin email (e.g., `admin@example.com`)
   - **Password**: A secure password (minimum 6 characters)
7. Click **Add User**

## Option 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create a user programmatically (requires Firebase Admin SDK)
```

## Option 3: Create a Temporary Registration Page

You can create a temporary page to register the first admin user, then remove it:

1. Create a file: `src/app/register-admin/page.tsx`
2. Add a registration form that uses Firebase Auth
3. After creating your admin account, delete the page

## Test Your Login

After creating an admin user:

1. Navigate to `/admin` or `/inventory`
2. You'll see the login modal
3. Enter your credentials
4. You should be logged in and see the admin dashboard

## Default Test Credentials

For testing purposes, create a user with:
- **Email**: `admin@example.com`
- **Password**: `admin123` (change this in production!)

## Security Notes

- ⚠️ Never commit real credentials to version control
- ⚠️ Use strong passwords for production
- ⚠️ Consider adding email verification
- ⚠️ Set up Firebase Security Rules to restrict access
- ⚠️ Add NEXTAUTH_SECRET to your environment variables

## Environment Variables

Add to your `.env.local` file:

```env
NEXTAUTH_SECRET=your-super-secret-key-here-change-this
NEXTAUTH_URL=http://localhost:3003
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32