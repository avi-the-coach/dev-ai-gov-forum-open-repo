# Quick Deploy to n8n-vm

## Current Setup
- n8n: port 5678
- Gotenberg (PDF): port 3000
- **Webinar Server: will use port 3001** ✓

---

## Step 1: Upload Files

From your local terminal:

```bash
cd C:\Users\aviba\Documents\Automation\webinar-registration\server
gcloud compute scp --recurse . n8n-vm:~/webinar-server/ --zone=me-west1-c
```

---

## Step 2: Build and Run (SSH into server)

Open browser SSH: https://ssh.cloud.google.com/v2/ssh/projects/n8n-automation-agileprimero/zones/me-west1-c/instances/n8n-vm

Then run:

```bash
cd ~/webinar-server

# Build image
sudo docker build -t webinar-game-server .

# Run container on port 3001
sudo docker run -d \
  --name webinar-game \
  --restart unless-stopped \
  -p 3001:8080 \
  -e PORT=8080 \
  -e ADMIN_SECRET=db68f563-e7f9-4acd-bfea-7008cd611972 \
  -e CORS_ORIGIN=* \
  webinar-game-server

# Check status
sudo docker ps | grep webinar
sudo docker logs webinar-game
```

---

## Step 3: Configure Firewall

From your local terminal:

```bash
gcloud compute firewall-rules create allow-webinar-game \
  --allow tcp:3001 \
  --target-tags http-server \
  --description "Webinar game server"
```

---

## Step 4: Test

Open in browser:
```
http://34.165.26.176:3001
```

---

## Step 5: Update Client Config

Edit `docs/config.js`:

```javascript
window.GAME_CONFIG = {
    SERVER_URL: 'http://34.165.26.176:3001'
};
```

---

## Done!

Your webinar server is running alongside n8n and Gotenberg without conflicts.
