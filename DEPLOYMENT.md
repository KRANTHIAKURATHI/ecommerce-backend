# Deployment Guide for Render

## Prerequisites

1. **Database**: Set up a MySQL database (e.g., on AWS RDS, Azure Database, or any cloud provider)
2. **Google OAuth**: Configure OAuth credentials from Google Cloud Console
3. **Render Account**: Sign up at [render.com](https://render.com)

## Environment Variables for Render

When deploying to Render, set these environment variables in the Render dashboard:

```
PORT=5000
FRONTEND_URL=https://your-frontend-domain.vercel.app (or your actual frontend URL)
BACKEND_URL=https://your-backend.onrender.com (your Render app URL)
DB_HOST=your-database-host.rds.amazonaws.com (or your DB host)
DB_USER=your_db_username
DB_PASSWORD=your_secure_db_password
DB_NAME=amazondb
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_secure_jwt_secret_min_32_characters
```

## Steps to Deploy on Render

### 1. Create a Web Service on Render
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select this repository

### 2. Configure Build & Start Commands
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Set Environment Variables
- In the Render dashboard, go to "Environment"
- Add all the variables from the table above

### 4. Set Up Your Database
You must use an external MySQL database. Options:
- **AWS RDS MySQL**
- **Azure Database for MySQL**
- **PlanetScale** (MySQL-compatible)
- **DigitalOcean Managed Databases**
- **Supabase** (PostgreSQL, but can use MySQL)

### 5. Update Google OAuth Callback URLs
Go to your Google Cloud Console and add:
- Authorized JavaScript origins: `https://your-backend.onrender.com`
- Authorized redirect URIs: `https://your-backend.onrender.com/api/auth/google/callback`

### 6. Deploy
- Push your code to GitHub
- Render will auto-deploy when you push to main branch

## Important Notes

⚠️ **NEVER commit .env file to GitHub**
- Keep `.env` only locally
- Use `.env.example` as template
- Add `node_modules/` and `.env` to `.gitignore`

⚠️ **Database Accessibility**
- Your Render server must be able to access your MySQL database
- Ensure firewall/security groups allow connections from Render IPs
- Use secure, strong passwords for database

✅ **Test Locally First**
```bash
# Create .env file locally with your database credentials
cp .env.example .env

# Install dependencies
npm install

# Run server
npm start
```

## Troubleshooting

**Error: "Can't connect to database"**
- Check DB_HOST, DB_USER, DB_PASSWORD are correct
- Ensure database firewall allows Render IPs
- Verify DB_NAME exists

**Error: "Google OAuth callback failed"**
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check Google Cloud Console has correct callback URL

**Error: "Frontend URL not recognized"**
- Ensure FRONTEND_URL is set correctly in Render environment
- Check CORS settings allow your frontend domain

## Monitoring

After deployment:
1. Check Render logs for any errors
2. Test API endpoints: `https://your-backend.onrender.com/api/test`
3. Test Google login flow
4. Monitor database connections
