# 🔐 Google Sign-In Setup Guide for Smart Tutor Dashboard

This guide will help you enable Google Sign-In authentication using Supabase OAuth for your Smart Tutor Dashboard.

## 📋 Prerequisites

- Supabase project with your Smart Tutor Dashboard
- Google Cloud Console account
- Domain configured for your application

## 🚀 Step-by-Step Setup

### 1. Configure Google OAuth in Supabase

#### **Step 1a: Get Google OAuth Credentials**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Add authorized redirect URIs:
     ```
     https://crmotgnkopdlikisdpie.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (for development)
     ```
5. **Copy Client ID and Client Secret**

#### **Step 1b: Configure Supabase Authentication**

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication** → **Providers**
3. **Enable Google provider**:
   - Toggle **Enable Google**
   - Paste **Client ID** from Google Cloud Console
   - Paste **Client Secret** from Google Cloud Console
   - Save configuration

### 2. Update Environment Variables

Update your `.env` file with the Google Client ID:

```env
# Google OAuth Client ID (get from Google Cloud Console)
REACT_APP_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
```

### 3. Test Google Sign-In

1. **Restart your development server**:
   ```bash
   npm start
   ```

2. **Navigate to login page**: http://localhost:3000/login

3. **Click "Continue with Google"** button

4. **Complete Google OAuth flow**

## 🔧 Advanced Configuration

### Enable Additional Google Scopes

You can request additional permissions by configuring scopes in Supabase:

1. Go to **Authentication** → **Providers** → **Google**
2. Add additional scopes in the **Scopes** field:
   ```
   openid email profile https://www.googleapis.com/auth/userinfo.profile
   ```

### Custom Redirect Handling

The authentication flow will automatically redirect users after successful login. You can customize this behavior by:

1. **Setting redirect URLs** in Supabase Authentication settings
2. **Handling auth state changes** in your React components (already implemented)

## 🎯 What Happens After Setup

### **User Experience:**
1. **Click Google Sign-In**: User clicks the "Continue with Google" button
2. **OAuth Flow**: Redirected to Google's consent screen
3. **Permission Grant**: User grants permissions to your app
4. **Automatic Account Creation**: New users are automatically created in your database
5. **Dashboard Access**: User is logged in and redirected to dashboard

### **Database Integration:**
- **Automatic user creation**: New Google users are added to your `users` table
- **Profile information**: Name, email, and avatar are automatically populated
- **Role assignment**: New users get the default 'student' role
- **Login tracking**: Last login and login count are updated

## 🛠️ Troubleshooting

### Issue: "Google Sign-In not available"
**Solution**: 
1. Check that `REACT_APP_GOOGLE_CLIENT_ID` is set in `.env`
2. Verify the Client ID is correct
3. Ensure Google+ API is enabled in Google Cloud Console

### Issue: "Redirect URI mismatch"
**Solution**:
1. Add your domain to authorized redirect URIs in Google Cloud Console
2. Include both development (`http://localhost:3000`) and production URLs
3. Format: `https://your-supabase-project.supabase.co/auth/v1/callback`

### Issue: "Authentication failed"
**Solution**:
1. Check Supabase logs in the dashboard
2. Verify Google Client Secret is correctly configured
3. Ensure the Google Cloud project has the correct APIs enabled

### Issue: "User not created in database"
**Solution**:
1. Check database permissions and RLS policies
2. Verify the `users` table exists with proper schema
3. Check Supabase Auth webhook configuration

## 📊 Analytics & Monitoring

The implementation includes automatic tracking for:
- **Google sign-in attempts**: Tracked in analytics
- **User creation events**: New Google users logged
- **Authentication errors**: Failed attempts recorded
- **User behavior**: Sign-in patterns and frequency

## 🔐 Security Best Practices

### Environment Variables
- **Never commit** `.env` files to version control
- **Use different credentials** for development and production
- **Regularly rotate** Client Secrets

### Supabase Security
- **Row Level Security**: Enabled by default for user data
- **JWT tokens**: Automatically managed by Supabase
- **Session management**: Built-in token refresh

### Google OAuth Security
- **Minimal scopes**: Only request necessary permissions
- **Domain verification**: Verify your domain with Google
- **Regular audits**: Monitor OAuth consent screen

## 🚀 Production Deployment

### Before going live:

1. **Update redirect URIs** with your production domain
2. **Configure production environment variables**
3. **Test the complete flow** on your production site
4. **Monitor authentication logs** in Supabase dashboard

### Production checklist:
- ✅ Google Cloud Console configured with production URLs
- ✅ Supabase Authentication provider enabled
- ✅ Environment variables set correctly
- ✅ Database schema deployed
- ✅ RLS policies configured
- ✅ Error monitoring in place

## 🎉 Success!

Once configured, your users will be able to:
- **Sign in seamlessly** with their Google accounts
- **Access the dashboard** immediately after authentication
- **Have their profiles** automatically populated
- **Enjoy secure authentication** backed by Google and Supabase

Your Smart Tutor Dashboard now supports professional-grade Google Sign-In! 🎯

---

**Need help?** Check the [Supabase Auth documentation](https://supabase.com/docs/guides/auth) or [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2) for more detailed information.