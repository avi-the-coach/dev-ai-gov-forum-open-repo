# Deploy Webinar Server to n8n-stack

## Summary
Adding webinar-game service to existing docker-compose with n8n and gotenberg.

**Ports:**
- n8n: 5678
- gotenberg: 3000
- webinar-game: 3001 ✓ (no conflict)

---

## Step 1: Copy Files to Server

The files are already uploaded to `~/webinar-server/`. Now we need to move them:

```bash
# Move webinar-server to n8n-stack directory
sudo mv /home/avi_bachar/webinar-server /home/aviba/n8n-stack/webinar-server

# Fix ownership
sudo chown -R aviba:aviba /home/aviba/n8n-stack/webinar-server
```

---

## Step 2: Update docker-compose.yml

Now we'll update the compose file. First, backup the current one:

```bash
sudo cp /home/aviba/n8n-stack/docker-compose.yml /home/aviba/n8n-stack/docker-compose.yml.backup
```

Then create the new compose file:

```bash
sudo tee /home/aviba/n8n-stack/docker-compose.yml > /dev/null << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    ports:
      - "5678:5678"
    volumes:
      - /home/avi_bachar/.n8n:/home/node/.n8n
    environment:
      - N8N_HOST=n8n.agileprimero.com
      - WEBHOOK_URL=https://n8n.agileprimero.com/
      - N8N_LISTEN_ADDRESS=0.0.0.0
    restart: unless-stopped
    depends_on:
      - gotenberg
    networks:
      - n8n-network

  gotenberg:
    image: gotenberg/gotenberg:8
    container_name: gotenberg
    ports:
      - "3000:3000"
    restart: unless-stopped
    networks:
      - n8n-network

  webinar-game:
    build:
      context: ./webinar-server
      dockerfile: Dockerfile
    container_name: webinar-game
    ports:
      - "3001:8080"
    environment:
      - PORT=8080
      - ADMIN_SECRET=db68f563-e7f9-4acd-bfea-7008cd611972
      - CORS_ORIGIN=*
    restart: unless-stopped
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
EOF
```

---

## Step 3: Build and Start

```bash
cd /home/aviba/n8n-stack

# Build the new service
sudo docker-compose build webinar-game

# Start only the new service (keeps n8n and gotenberg running)
sudo docker-compose up -d webinar-game

# Check all services
sudo docker-compose ps
```

---

## Step 4: Verify

```bash
# Check logs
sudo docker-compose logs webinar-game

# Test locally
curl http://localhost:3001
```

---

## Rollback (if needed)

If something goes wrong:

```bash
# Stop and remove webinar service
sudo docker-compose stop webinar-game
sudo docker-compose rm -f webinar-game

# Restore original compose file
sudo cp /home/aviba/n8n-stack/docker-compose.yml.backup /home/aviba/n8n-stack/docker-compose.yml
```

---

## All Services Management

Now you can manage all 3 services together:

```bash
# View all services
sudo docker-compose ps

# Restart all services
sudo docker-compose restart

# Stop all services
sudo docker-compose stop

# Start all services
sudo docker-compose up -d

# View logs for all services
sudo docker-compose logs -f

# View logs for specific service
sudo docker-compose logs -f webinar-game
```
