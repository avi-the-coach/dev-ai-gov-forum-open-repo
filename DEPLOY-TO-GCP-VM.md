# Deploy Webinar Server to GCP Compute Engine

## Server Information
- **Instance Name**: n8n-vm
- **Zone**: me-west1-c
- **External IP**: 34.165.26.176
- **Internal IP**: 10.208.0.2

---

## Step 1: Connect to Server

Open a terminal and SSH into the server:

```bash
gcloud compute ssh n8n-vm --zone=me-west1-c
```

Accept the SSH host key when prompted (type 'y').

---

## Step 2: Investigate Existing Setup

Once connected, check what's already running:

```bash
# Check existing containers
sudo docker ps -a

# Check used ports
sudo netstat -tuln | grep LISTEN

# Check Docker networks
sudo docker network ls

# Check disk space
df -h
```

**Make note of:**
- Container names and ports
- Which ports are already in use
- Docker networks being used

---

## Step 3: Create Deployment Directory

```bash
# Create directory for webinar server
mkdir -p ~/webinar-registration
cd ~/webinar-registration
```

---

## Step 4: Upload Files to Server

From your local machine, upload the server files:

```bash
# From local terminal (not SSH session)
cd C:\Users\aviba\Documents\Automation\webinar-registration\server

# Upload files to server
gcloud compute scp --recurse . n8n-vm:~/webinar-registration/ --zone=me-west1-c
```

---

## Step 5: Build and Run Container

Back in the SSH session:

```bash
cd ~/webinar-registration

# Build the Docker image
sudo docker build -t webinar-game-server .

# Run the container
sudo docker run -d \
  --name webinar-game \
  --restart unless-stopped \
  -p 3000:8080 \
  -e PORT=8080 \
  -e ADMIN_SECRET=db68f563-e7f9-4acd-bfea-7008cd611972 \
  -e CORS_ORIGIN=* \
  webinar-game-server

# Check if running
sudo docker ps | grep webinar-game

# Check logs
sudo docker logs webinar-game
```

**Note**: Port 3000 might be in use. If so, use a different port like 3001 or 3002:
```bash
# If port 3000 is taken, use 3001 instead
sudo docker run -d \
  --name webinar-game \
  --restart unless-stopped \
  -p 3001:8080 \
  -e PORT=8080 \
  -e ADMIN_SECRET=db68f563-e7f9-4acd-bfea-7008cd611972 \
  -e CORS_ORIGIN=* \
  webinar-game-server
```

---

## Step 6: Configure Firewall

Allow traffic to the webinar server port:

```bash
# From local terminal
gcloud compute firewall-rules create allow-webinar-game \
  --allow tcp:3000 \
  --target-tags http-server \
  --description "Allow webinar game server traffic"

# If using different port (e.g., 3001)
gcloud compute firewall-rules create allow-webinar-game \
  --allow tcp:3001 \
  --target-tags http-server \
  --description "Allow webinar game server traffic"
```

---

## Step 7: Test Connection

From your browser, try accessing:

```
http://34.165.26.176:3000
```

Or if you used port 3001:
```
http://34.165.26.176:3001
```

You should see a response from the server.

---

## Step 8: Update Client Configuration

Update the client config to use the GCP server:

**File**: `docs/config.js`

```javascript
window.GAME_CONFIG = {
    SERVER_URL: 'http://34.165.26.176:3000'  // Or your port
};
```

---

## Troubleshooting

### Container won't start
```bash
# Check container logs
sudo docker logs webinar-game

# Check if port is in use
sudo netstat -tuln | grep 3000

# Try a different port
sudo docker rm webinar-game
# Then rerun with -p 3001:8080
```

### Can't connect from browser
```bash
# Verify container is running
sudo docker ps | grep webinar-game

# Check firewall rules
gcloud compute firewall-rules list | grep webinar

# Test from server itself
curl http://localhost:3000
```

### WebSocket connection fails
- Ensure CORS_ORIGIN is set to '*' or your client domain
- Check browser console for errors
- Verify firewall allows the port

---

## Useful Commands

```bash
# View container logs
sudo docker logs -f webinar-game

# Restart container
sudo docker restart webinar-game

# Stop container
sudo docker stop webinar-game

# Remove container
sudo docker rm webinar-game

# Update and redeploy
sudo docker stop webinar-game
sudo docker rm webinar-game
sudo docker build -t webinar-game-server .
sudo docker run -d --name webinar-game --restart unless-stopped -p 3000:8080 -e PORT=8080 -e ADMIN_SECRET=db68f563-e7f9-4acd-bfea-7008cd611972 -e CORS_ORIGIN=* webinar-game-server
```

---

## Using Docker Compose (Alternative)

If you prefer Docker Compose:

```bash
cd ~/webinar-registration

# Start services
sudo docker-compose up -d

# View logs
sudo docker-compose logs -f

# Stop services
sudo docker-compose down
```

---

## Next Steps After Deployment

1. Test admin panel with your server URL
2. Create a game and test player registration
3. Verify WebSocket connections work
4. Consider setting up HTTPS with Let's Encrypt
5. Set up monitoring and alerting

---

## Production Recommendations

For production use, consider:

1. **HTTPS**: Set up nginx reverse proxy with Let's Encrypt SSL
2. **Domain**: Use a proper domain name instead of IP
3. **Monitoring**: Set up logging and monitoring
4. **Backups**: Regular backups of game data
5. **Secrets**: Use Docker secrets or environment files
6. **Updates**: Plan for zero-downtime deployments
