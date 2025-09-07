# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your notes blog application.

## Prerequisites

1. A Google Cloud Platform account
2. Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google OAuth2 API" if available

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Configure the OAuth consent screen if prompted:
   - Choose "External" user type
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add your email to test users

## Step 4: Configure OAuth Client

1. In the OAuth client configuration:

   - **Name**: Give it a descriptive name (e.g., "Notes Blog OAuth")
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `http://localhost:3001` (for backend)
     - Add your production URLs when deploying
   - **Authorized redirect URIs**:
     - `http://localhost:3001/api/auth/google/callback` (for development)
     - Add your production callback URL when deploying

2. Click "Create" and copy the Client ID and Client Secret

## Step 5: Configure Environment Variables

1. Copy the backend environment example:

   ```bash
   cp backend/env.example backend/.env
   ```

2. Update the `.env` file with your Google OAuth credentials:
   ```env
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID="your-google-client-id-here"
   GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
   ```

## Step 6: Install Dependencies

The required dependencies are already included in the package.json files, but if you need to install them manually:

```bash
# Backend dependencies (already included)
cd backend
npm install passport passport-google-oauth20 express-session

# Frontend dependencies (already included)
cd ../frontend
npm install
```

## Step 7: Database Migration

The database schema already includes the necessary tables for OAuth (Account, Session, User models). If you need to apply migrations:

```bash
cd backend
npx prisma db push
```

## Step 8: Test the Implementation

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:

   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/login`
4. Click the "Google" button to test the OAuth flow

## How It Works

### Backend Flow

1. **Initiate OAuth**: User clicks "Continue with Google" button
2. **Redirect to Google**: Frontend redirects to `/api/auth/google`
3. **Google Authentication**: User authenticates with Google
4. **Callback**: Google redirects to `/api/auth/google/callback`
5. **User Creation/Linking**: Backend creates or links user account
6. **JWT Generation**: Backend generates JWT token
7. **Frontend Redirect**: Backend redirects to frontend with token

### Frontend Flow

1. **Auth Callback**: Frontend receives token at `/auth/callback`
2. **Token Storage**: Token is stored in localStorage
3. **User State**: User state is updated in AuthContext
4. **Redirect**: User is redirected to the writer dashboard

## Security Considerations

1. **Environment Variables**: Never commit OAuth credentials to version control
2. **HTTPS**: Use HTTPS in production for secure token transmission
3. **Token Expiration**: JWT tokens expire after 7 days (configurable)
4. **CORS**: Configure CORS properly for your domain

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch"**: Ensure the redirect URI in Google Console matches exactly
2. **"invalid_client"**: Check that Client ID and Secret are correct
3. **"access_denied"**: User may have denied permission or OAuth consent screen needs configuration

### Debug Steps

1. Check browser console for errors
2. Check backend logs for authentication errors
3. Verify environment variables are loaded correctly
4. Ensure Google OAuth consent screen is properly configured

## Production Deployment

When deploying to production:

1. Update OAuth client configuration with production URLs
2. Set secure session cookies (`secure: true`)
3. Use HTTPS for all OAuth redirects
4. Update environment variables with production values
5. Consider using a more secure session store (Redis, etc.)

## Additional Features

The implementation supports:

- **Account Linking**: Existing users can link Google accounts
- **Profile Information**: Name, email, and profile picture from Google
- **Seamless Integration**: Works alongside existing email/password authentication
- **Session Management**: Proper session handling with JWT tokens
