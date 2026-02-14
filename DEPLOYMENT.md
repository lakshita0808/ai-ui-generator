# Deployment Guide

This guide covers deploying the AI UI Generator to production.

## Architecture

The application consists of two parts:
1. **Frontend** (React/Vite) - Static site
2. **Backend** (Express/Node.js) - API server

## Option 1: Vercel (Recommended for Frontend)

### Frontend Deployment

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Build Settings**
   - **Root Directory**: `web`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**
   - Add `VITE_API_URL` pointing to your backend URL
   - Example: `VITE_API_URL=https://your-backend.railway.app`

4. **Deploy**
   - Click Deploy
   - Vercel will automatically deploy on every push to main

### Backend Deployment (Separate Service)

Deploy backend to Railway, Render, or Fly.io (see below).

---

## Option 2: Render

### Frontend (Static Site)

1. **New Static Site**
   - Connect repository
   - **Build Command**: `cd web && npm install && npm run build`
   - **Publish Directory**: `web/dist`

2. **Environment Variables**
   - `VITE_API_URL`: Your backend URL

### Backend (Web Service)

1. **New Web Service**
   - Connect repository
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
   - **Environment**: Node

2. **Environment Variables**
   - `PORT`: 10000 (Render default, or leave empty)
   - `NODE_ENV`: production

3. **Update Frontend**
   - Set `VITE_API_URL` to your Render backend URL

---

## Option 3: Railway

### Backend

1. **New Project**
   - Connect GitHub repository
   - Railway auto-detects Node.js

2. **Configure**
   - **Start Command**: `node server/server.js`
   - **Root Directory**: `.`

3. **Environment Variables**
   - `PORT`: Railway provides automatically
   - `NODE_ENV`: production

4. **Get URL**
   - Railway provides a public URL
   - Use this for `VITE_API_URL` in frontend

### Frontend

Deploy to Vercel or Netlify with `VITE_API_URL` pointing to Railway backend.

---

## Option 4: Fly.io

### Backend

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Initialize**
   ```bash
   fly launch
   ```

3. **Create fly.toml**
   ```toml
   app = "your-app-name"
   primary_region = "iad"

   [build]

   [http_service]
     internal_port = 5000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 256
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### Frontend

Deploy separately to Vercel/Netlify.

---

## Environment Variables Summary

### Frontend (.env or Vite env)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend
```
NODE_ENV=production
PORT=5000  # Or leave empty for platform default
```

---

## Testing Deployment

1. **Health Check**
   - Visit: `https://your-backend-url.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **API Test**
   ```bash
   curl -X POST https://your-backend-url.com/generate \
     -H "Content-Type: application/json" \
     -d '{"userText":"Create a card with a button"}'
   ```

3. **Frontend**
   - Visit your frontend URL
   - Try generating a UI
   - Check browser console for errors

---

## Troubleshooting

### CORS Issues
- Ensure backend has `cors()` middleware enabled
- Check that frontend URL is allowed (or use `cors()` without restrictions for demo)

### API Not Found
- Verify `VITE_API_URL` is set correctly
- Check backend is running and accessible
- Test backend health endpoint

### Build Failures
- Ensure all dependencies are in `package.json`
- Check Node.js version (16+)
- Review build logs for specific errors

---

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed with correct `VITE_API_URL`
- [ ] Health check endpoint working
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Test UI generation works
- [ ] Version history works
- [ ] Error handling displays properly
