# SigmaGPT - Production Deployment Guide

This guide covers how to deploy SigmaGPT to production with proper security, configuration, and best practices.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Security Configuration](#security-configuration)
4. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
5. [OpenAI API Setup](#openai-api-setup)
6. [Deployment to Render](#deployment-to-render)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

- [ ] Node.js >= 20.0.0 installed locally
- [ ] MongoDB Atlas account created
- [ ] OpenAI API account and API key obtained
- [ ] GitHub account and repository set up
- [ ] Render.com account created
- [ ] DNS domain configured (if using custom domain)
- [ ] All `.env` files properly configured
- [ ] Git repository is public (for Render Blueprint)

---

## Environment Setup

### Local Development

Create `Backend/.env` for local testing:

```env
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/sigmagpt
OPENAI_API_KEY=sk-your-key-here
MOCK_OPENAI=false
CORS_ORIGIN=http://localhost:5173
ENABLE_TEST_ENDPOINT=false
```

Create `Frontend/.env` for local testing:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Production (Render)

These will be set in Render Dashboard, never commit `Backend/.env` in production:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sigmagpt?...
OPENAI_API_KEY=sk-prod-key-here
MOCK_OPENAI=false
CORS_ORIGIN=https://your-frontend-domain.onrender.com
ENABLE_TEST_ENDPOINT=false
```

---

## Security Configuration

### Backend (`Backend/server.js`)

The production backend includes:

1. **CORS Security**
   - Development: Allows any origin for testing
   - Production: Restrict to specific domains (configured via `CORS_ORIGIN`)
   - To enable strict CORS: Uncomment the production code block in `server.js`

2. **Request Size Limits**
   - JSON payload limited to 1MB
   - Message length limited to 4000 characters

3. **Security Headers**
   - `X-Content-Type-Options: nosniff` — Prevent MIME sniffing
   - `X-XSS-Protection: 1; mode=block` — XSS protection
   - Production can include: HSTS, CSP, X-Frame-Options

4. **Error Handling**
   - Development: Shows detailed error messages
   - Production: Generic error messages to hide implementation details

### Input Validation (`Backend/routes/chat.js`)

- threadId length validation (max 100 chars)
- Message length validation (max 4000 chars)
- Empty message prevention
- Type checking for all inputs

### Sensitive Data Protection

- API keys never logged
- Detailed errors hidden in production
- Request timeouts prevent hanging connections

---

## Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free tier account
3. Create a new project

### 2. Create a Cluster

1. Click "Create Deployment"
2. Choose free tier (M0)
3. Select region (pick closer to your deployment region)
4. Wait for cluster to deploy (5-10 minutes)

### 3. Create Database User

1. Go to **Database Access** → **Add New Database User**
2. Create username: e.g., `sigmagpt-user`
3. Set strong password and save it securely
4. Select **Read and write to any database**

### 4. Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. Allow `0.0.0.0/0` for Render servers (or specific IPs later)
3. Click **Confirm**

### 5. Get Connection String

1. Go to **Clusters** → **Connect**
2. Select **Drivers** → **Node.js**
3. Copy the SRV connection string
4. Format:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sigmagpt?retryWrites=true&w=majority
   ```
5. Replace `USER`, `PASSWORD`, and include `/sigmagpt` (database name)
6. URL-encode special characters in password (e.g., `@` → `%40`)

---

## OpenAI API Setup

### 1. Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create new secret key
3. Copy and save securely (never share)

### 2. Set Up Billing

1. Go to **Billing** → **Overview**
2. Add payment method
3. Set usage limits to prevent surprise charges
4. Monitor usage in **Usage** dashboard

### 3. Test Connection

Before deploying, test with your key:

```bash
export OPENAI_API_KEY="sk-your-key"
export MOCK_OPENAI=false
npm run dev
# Test sending a message
```

---

## Deployment to Render

### 1. Prepare GitHub Repository

```bash
# Push to GitHub
git add .
git commit -m "Production-ready deployment"
git push origin main
```

**Ensure `.env` is in `.gitignore`:**

```
# .gitignore
.env
.env.local
Backend/.env
Frontend/.env
node_modules/
dist/
.DS_Store
```

### 2. Create Render Blueprint Deployment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Select branch (`main`)
5. Click **Create from Blueprint**

### 3. Configure Environment Variables

Render will prompt for:

**Variables to Set:**

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Atlas SRV string | `mongodb+srv://user:pass@cluster.mongodb.net/sigmagpt?...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `NODE_ENV` | `production` | (auto-set in render.yaml) |
| `MOCK_OPENAI` | `false` | (auto-set in render.yaml) |
| `CORS_ORIGIN` | Frontend URL | `https://sigmagpt-frontend.onrender.com` |

### 4. Deploy

1. Click **Deploy**
2. Wait for both services to build and start
3. You'll see blue checkmarks when ready

---

## Post-Deployment Steps

### 1. Verify Backend Health

```bash
curl https://<your-backend>.onrender.com/api/health
# Expected response:
# {"ok":true,"ts":1234567890,"env":"production"}
```

### 2. Configure CORS

After first deploy, update `CORS_ORIGIN` in Render Dashboard:

1. Go to **Services** → **sigmagpt-backend**
2. Go to **Environment**
3. Add/Edit `CORS_ORIGIN` variable
4. Set to your frontend URL: `https://sigmagpt-frontend.onrender.com`
5. **Deploy** the backend service

### 3. Test Full Application

1. Visit `https://sigmagpt-frontend.onrender.com`
2. Create new chat
3. Send test message
4. Verify response appears correctly

### 4. Set Up Auto-Deploy

1. **Services** → **sigmagpt-backend** → **Settings**
2. Enable **Auto-Deploy**
3. Select branch and deployment strategy
4. Repeat for frontend service

### 5. Configure Custom Domain (Optional)

1. **Services** → **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed
4. Set up SSL certificate (auto-generated)

---

## Monitoring & Maintenance

### Regular Tasks

- **Daily**: Check error logs in Render dashboard
- **Weekly**: Monitor API usage and costs
- **Monthly**: Review MongoDB storage and performance
- **Quarterly**: Update dependencies and security patches

### Setting Alerts

In Render Dashboard:

1. Go to **Settings** → **Notifications**
2. Enable email alerts for:
   - Deploy failures
   - Service crashes
   - Resource limits (CPU, memory)

### Database Monitoring

In MongoDB Atlas:

1. Go to **Clusters** → **Performance Advisor**
2. Check slow queries
3. Monitor disk usage
4. Review operation metrics

### Viewing Logs

**Backend logs:**
```bash
# In Render dashboard: Services → sigmagpt-backend → Logs
# Or via Render CLI
render logs sigmagpt-backend
```

**Error logs:**
- Check `/api/health` endpoint
- Search logs for `[ERROR]`

---

## Troubleshooting

### Backend Won't Start

**Error: `Missing MONGODB_URI`**
- Verify `MONGODB_URI` is set in Render environment
- Check connection string format (include `/sigmagpt`)
- Test locally: `MONGODB_URI=... npm run start`

**Error: `Missing OPENAI_API_KEY`**
- Set `OPENAI_API_KEY` in Render environment
- Or set `MOCK_OPENAI=true` for testing
- Verify key is valid in OpenAI dashboard

### CORS Errors in Browser

**Error: `The CORS header 'Access-Control-Allow-Origin' is missing`**
- Verify `CORS_ORIGIN` matches frontend URL in Render dashboard
- No trailing slash in URL
- Restart backend service after updating

### Messages Not Sending

**Error: `Failed to get response`**
- Check backend is running: curl `/api/health`
- Check `VITE_API_BASE_URL` in frontend (no trailing slash)
- Verify MongoDB connection in logs
- Check OpenAI API key validity

**Error: `Thread not found`**
- Verify MongoDB is connected
- Check database name is `sigmagpt`
- Confirm thread data was saved

### Slow Responses

**Symptoms: Responses take >30 seconds**
- Free tier Render services may spin down
- First request after spin-down is slow (30-60 sec)
- Upgrade to Standard plan for better performance
- Consider keeping a "pinger" service

### Database Connection Issues

**Error: `connection timeout`**
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string has correct password
- Check database name in URL (`/sigmagpt`)
- Test connection locally with same URI

---

## Cost Optimization

### Free Tier (Suitable for Testing)

- **Render**: Free tier includes 750 free hours/month
- **MongoDB**: Free tier 5GB storage
- **OpenAI**: Pay only for API usage

### Reducing Costs

1. **Render Auto-sleep**: Free tier services sleep after 15 min inactivity
   - Set up a monitoring script to ping `/api/health`
   - Use cron job service for periodic pings

2. **MongoDB**:
   - Monitor collection size
   - Archive old threads regularly
   - Use indexes for query optimization

3. **OpenAI**:
   - Set usage limits in billing dashboard
   - Use `gpt-4o-mini` model (cheaper than GPT-4)
   - Monitor API usage daily
   - Consider batch processing for non-time-critical requests

---

## Production Checklist

Before going live:

- [ ] `NODE_ENV=production` set in backend
- [ ] `OPENAI_API_KEY` configured (real key, not mock)
- [ ] `MONGODB_URI` points to production Atlas
- [ ] `CORS_ORIGIN` set to production frontend domain
- [ ] `ENABLE_TEST_ENDPOINT=false`
- [ ] Backend `/api/health` returns success
- [ ] Frontend loads correctly
- [ ] Test message → response flow works
- [ ] Error messages don't expose internal details
- [ ] Logs show `[PRODUCTION]` or `[PROD]` prefixes
- [ ] SSL certificates configured (auto on Render)
- [ ] Backups configured in MongoDB Atlas
- [ ] Monitoring and alerts enabled
- [ ] Rate limiting considered for production scale

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Express.js**: https://expressjs.com
- **Vite**: https://vitejs.dev

---

**Last Updated**: April 2026
