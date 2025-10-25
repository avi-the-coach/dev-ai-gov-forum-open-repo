# Deployment Guide - GCP

This guide covers deploying the webinar registration system with real-time team game to Google Cloud Platform.

## Architecture Overview

The system consists of two parts:
1. **Static Client** - HTML/CSS/JS files (served from Cloud Storage or Cloud Run)
2. **Node.js Server** - WebSocket server with Socket.io (must run on Cloud Run or Compute Engine)

## Prerequisites

- GCP Project with billing enabled
- `gcloud` CLI installed and authenticated
- Domain name (optional, for custom domain)

---

## Option 1: Cloud Run (Recommended)

Cloud Run is best for the WebSocket server because it auto-scales and handles SSL.

### Step 1: Prepare the Server

1. Create `Dockerfile` in the `server/` directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server files
COPY . .

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
```

2. Update `server/config.js` to use PORT from environment:

```javascript
PORT: process.env.PORT || 3000,
```

### Step 2: Set Environment Variables

Create `.env` file with your secrets (DO NOT commit this):

```bash
ADMIN_SECRET=your-secret-here
PORT=8080
CORS_ORIGIN=https://your-domain.com
```

### Step 3: Deploy Server to Cloud Run

```bash
# Navigate to server directory
cd server

# Build and deploy
gcloud run deploy webinar-game-server \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ADMIN_SECRET=your-secret-here \
  --set-env-vars CORS_ORIGIN=https://your-client-domain.com \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi
```

**Important**: Use `--min-instances 1` to keep WebSocket connections alive.

### Step 4: Deploy Static Client

#### Option A: GitHub Pages (Free, Simple)

1. Update `docs/config.js`:
```javascript
window.GAME_CONFIG = {
    SERVER_URL: 'https://webinar-game-server-xxx.run.app'  // Your Cloud Run URL
};
```

2. Push to GitHub:
```bash
git add docs/config.js
git commit -m "Update server URL for production"
git push origin main
```

3. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Source: Deploy from branch
   - Branch: main
   - Folder: /docs
   - Save

4. Access at: `https://your-username.github.io/your-repo/webinar-registration-ai-in-dev-v2.html`

#### Option B: Cloud Storage + CDN

```bash
# Create bucket
gsutil mb gs://your-webinar-bucket

# Upload files
gsutil -m cp -r docs/* gs://your-webinar-bucket/

# Make public
gsutil iam ch allUsers:objectViewer gs://your-webinar-bucket

# Enable website configuration
gsutil web set -m webinar-registration-ai-in-dev-v2.html gs://your-webinar-bucket
```

Access at: `https://storage.googleapis.com/your-webinar-bucket/webinar-registration-ai-in-dev-v2.html`

---

## Option 2: Compute Engine (More Control)

Use this if you need persistent VMs or custom networking.

### Step 1: Create VM

```bash
gcloud compute instances create webinar-server \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --tags=http-server,https-server
```

### Step 2: Setup Firewall

```bash
gcloud compute firewall-rules create allow-webinar \
  --allow tcp:3000 \
  --target-tags http-server
```

### Step 3: SSH and Install

```bash
# SSH to VM
gcloud compute ssh webinar-server --zone=us-central1-a

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo/server

# Install dependencies
npm install

# Setup environment
nano .env
# Add your ADMIN_SECRET, PORT, CORS_ORIGIN

# Start server with PM2
sudo npm install -g pm2
pm2 start server.js --name webinar-server
pm2 startup
pm2 save
```

---

## Security Checklist

- [ ] Set strong `ADMIN_SECRET` in environment variables
- [ ] Configure `CORS_ORIGIN` to your actual domain
- [ ] Enable HTTPS (Cloud Run does this automatically)
- [ ] Do NOT commit `.env` or `admin-credentials.json` files
- [ ] Set `--min-instances 1` for Cloud Run to avoid cold starts
- [ ] Review firewall rules
- [ ] Use Cloud Secret Manager for secrets (advanced)

---

## Post-Deployment

### Test the Deployment

1. **Client Access**: Visit your client URL
2. **WebSocket Connection**: Check browser console - should see "Connected to game server"
3. **Admin Panel**: Upload `admin-credentials.json` - should authenticate
4. **Game Flow**:
   - Create game
   - Register players
   - Start game
   - Check leaderboard updates in real-time

### Monitoring

**Cloud Run:**
```bash
# View logs
gcloud run services logs read webinar-game-server --limit 50

# Monitor metrics
gcloud run services describe webinar-game-server
```

**Compute Engine:**
```bash
# Check server status
pm2 status

# View logs
pm2 logs webinar-server
```

---

## Cost Estimates

**Cloud Run (Recommended)**:
- Free tier: 2M requests/month
- Estimated cost: $5-20/month for moderate traffic
- WebSocket connections count as long-running requests

**Compute Engine**:
- e2-micro: ~$7/month (free tier eligible)
- Network egress: varies

---

## Troubleshooting

**WebSocket not connecting:**
- Check CORS_ORIGIN in server config
- Verify Cloud Run allows unauthenticated access
- Check browser console for errors

**Admin login fails:**
- Verify ADMIN_SECRET matches in server and credentials file
- Check server logs for authentication attempts

**Players can't register:**
- Ensure game state is "active"
- Check server logs for registration errors
- Verify WebSocket connection is established

---

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificate (automatic with Cloud Run)
3. Set up monitoring and alerts
4. Configure backup strategy for player data
5. Add analytics tracking

For questions or issues, check the server logs first:
```bash
gcloud run services logs read webinar-game-server --tail
```
