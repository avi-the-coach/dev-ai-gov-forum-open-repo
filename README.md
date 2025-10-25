# Webinar Registration Form - Real-Time Team Game

Interactive webinar registration application with optional real-time team competition mode.

**Live Demo**: [GitHub Pages](https://avi-the-coach.github.io/dev-ai-gov-forum-open-repo/webinar-registration-ai-in-dev-v2.html)
**Repository**: https://github.com/avi-the-coach/dev-ai-gov-forum-open-repo

---

## Features

### Standalone Mode (Always Works)
- ✅ Webinar registration form
- ✅ Interactive floating logos and alien spaceships
- ✅ Local scoring system
- ✅ Form submission via Gmail/WhatsApp/Outlook
- ✅ Works without server or JavaScript

### Game Mode (Optional)
- 🎮 Real-time Red vs Green team competition
- 🏆 Live leaderboards synchronized across all players
- ⏱️ Customizable game timer (30s to 5min)
- 👥 Auto-balanced team assignment
- 🔐 Secure admin panel with file-based authentication
- 📊 Player management and IP blocking
- 🚫 Progressive enhancement - form works even if server is down

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Git installed

### 1. Clone Repository
```bash
git clone https://github.com/avi-the-coach/dev-ai-gov-forum-open-repo.git
cd dev-ai-gov-forum-open-repo
```

### 2. Run Setup Script

**Windows:**
```batch
setup.bat
```

**macOS/Linux:**
```bash
node setup.js
```

The setup script will ask you:
- Server URL for admin panel (default: `http://localhost:3000`)
- CORS origin (default: `http://localhost:8080`)
- Server URL for clients (default: `http://localhost:3000`)

### 3. Save Admin Credentials

⚠️ **CRITICAL SECURITY STEP:**

After setup completes:

1. 🔒 **SAVE** `admin-credentials.json` to a **SAFE location**
   - USB drive
   - Password manager
   - Encrypted folder
   - **NOT in the project folder!**

2. 🗑️ **DELETE** `admin-credentials.json` from project folder
   ```bash
   # Windows
   del admin-credentials.json

   # macOS/Linux
   rm admin-credentials.json
   ```

3. ⚠️ **NEVER** commit or share this file

### 4. Install Server Dependencies
```bash
cd server
npm install
```

### 5. Start Server
```bash
node server.js
```

Or for development with auto-reload:
```bash
npm run dev
```

Server will start on `http://localhost:3000`

### 6. Access Admin Panel

1. Open `docs/admin-panel.html` in your browser
2. Click "🔑 Admin Login"
3. Select your saved `admin-credentials.json` file
4. You're now authenticated! 🎉

### 7. Share with Participants

Share the client URL with your webinar participants:
```
docs/webinar-registration-ai-in-dev-v2.html
```

Or via GitHub Pages:
```
https://avi-the-coach.github.io/dev-ai-gov-forum-open-repo/webinar-registration-ai-in-dev-v2.html
```

---

## 📁 Project Structure

```
/
├── setup.js                    # Setup script (generates configs)
├── setup.bat                   # Windows wrapper
├── .gitignore                  # Git security rules
│
├── server/                     # Backend server
│   ├── .env                    ❌ Git ignored (secrets)
│   ├── .env.example            ✅ Template
│   ├── server.js               # Entry point
│   ├── config.js               # Configuration
│   ├── game-manager.js         # Game state & timer
│   ├── player-manager.js       # Player management
│   ├── websocket-handler.js    # WebSocket events
│   └── package.json
│
├── docs/                       # Frontend (GitHub Pages)
│   ├── admin-panel.html        # Admin interface
│   ├── webinar-registration-ai-in-dev-v2.html
│   ├── config.js               # Client server URL
│   ├── config.example.js       ✅ Template
│   ├── js/
│   │   ├── game-client.js      # WebSocket client
│   │   ├── game-ui.js          # Game UI
│   │   ├── form-handler.js     # Form logic
│   │   ├── floating-bg.js      # Floating logos
│   │   └── alien-spaceship.js  # Alien animations
│   └── css/
│       ├── game-styles.css
│       └── styles.css
│
├── specs/                      # Design documentation
│   ├── real-time-team-game-spec.md
│   └── secure-configuration-spec.md
│
└── admin-credentials.json      ❌ Git ignored (delete after setup!)
```

---

## 🔐 Security

### Secrets Management

**Server Secret** (`ADMIN_SECRET`):
- Generated once by setup script
- Stored only in `server/.env` (git ignored)
- Never exposed to clients
- Validated on every admin action

**Admin Credentials File** (`admin-credentials.json`):
- User saves to secure location
- Deleted from project after setup
- Can be regenerated if lost (run `node setup.js` again)
- Never committed to git

**Client Config** (`docs/config.js`):
- Server URL only (not secret)
- Can be committed safely

### Security Best Practices

✅ Keep `admin-credentials.json` private and secure
✅ Never commit `.env` files
✅ Use HTTPS in production
✅ Change default server URLs for production
✅ If credentials lost, run `node setup.js` to regenerate

❌ Never share `admin-credentials.json`
❌ Never commit secrets to git
❌ Never use default configs in production

---

## 🎮 Game Management

### Admin Panel Features

**Game Controls:**
- Create Game - Initialize game with selected duration
- Start Game - Begin timer and enable scoring
- Finish Game - End game immediately
- Reset Scores & Restart Timer - Keep players, reset scores
- Reset Game + Delete All Members - Full reset
- Delete Game Completely - Remove game entirely

**Dashboard:**
- Connection status indicator
- Game state badge (idle/registration/active/ended)
- Player count by team (Red/Green/Total)
- Team scores with color coding
- Game timer with warmup countdown
- Dual-column leaderboards

**Player Management:**
- View all players with scores
- Delete individual players (auto-blocks IP)
- Advanced settings to show/hide IP addresses
- Blocked IP management

### Game States

1. **idle** - No game exists
2. **registration** - Game created, players can join
3. **active** - Timer running, scoring enabled
4. **ended** - Final scores frozen

### Game Durations

- 30 seconds
- 60 seconds (1 minute) - Default
- 90 seconds (1.5 minutes)
- 120 seconds (2 minutes)
- 300 seconds (5 minutes)

---

## 🌐 Production Deployment

### Deploy Server (Google Cloud Platform)

1. **Create GCP VM Instance**
   ```bash
   # SSH into your VM
   gcloud compute ssh your-vm-name
   ```

2. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd webinar-registration
   node setup.js
   ```

   When prompted:
   - Server URL: `https://your-gcp-domain.com`
   - CORS origin: `https://your-github-username.github.io`
   - Client server URL: `https://your-gcp-domain.com`

3. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Start with PM2** (process manager)
   ```bash
   npm install -g pm2
   pm2 start server.js --name webinar-game
   pm2 save
   pm2 startup
   ```

5. **Save Admin Credentials**
   - Download `admin-credentials.json` to your local machine
   - Delete from server: `rm ../admin-credentials.json`

### Deploy Client (GitHub Pages)

1. **Update Client Config**
   ```bash
   # Edit docs/config.js
   window.GAME_CONFIG = {
       SERVER_URL: 'https://your-gcp-domain.com'
   };
   ```

2. **Commit and Push**
   ```bash
   git add docs/config.js
   git commit -m "Update server URL for production"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/docs`
   - Save

4. **Access URLs**
   - Client: `https://your-github-username.github.io/repo-name/webinar-registration-ai-in-dev-v2.html`
   - Admin: `https://your-github-username.github.io/repo-name/admin-panel.html`

---

## 🧪 Testing

### Local Testing Checklist

- [ ] Run `node setup.js` successfully
- [ ] Verify `server/.env` created
- [ ] Verify `admin-credentials.json` created
- [ ] Verify `docs/config.js` created
- [ ] Start server: `cd server && node server.js`
- [ ] Server starts without errors
- [ ] Open `docs/admin-panel.html`
- [ ] See login screen
- [ ] Upload `admin-credentials.json`
- [ ] Admin dashboard appears
- [ ] All admin controls work
- [ ] Create game
- [ ] Open client in another tab
- [ ] Click "Game On" and register
- [ ] Player appears in admin panel
- [ ] Submit score (blast logo/alien)
- [ ] Score updates in admin panel
- [ ] Refresh admin panel - requires re-authentication ✓
- [ ] Test with invalid credentials - shows error ✓

### Security Testing

- [ ] Verify secrets not in git history
- [ ] Verify `.gitignore` working
- [ ] Verify admin secret not in localStorage
- [ ] Verify admin commands validate secret
- [ ] Test connection without credentials - fails ✓
- [ ] Test command without secret - fails ✓

---

## 🐛 Troubleshooting

### Setup Issues

**Error: "ADMIN_SECRET not found in .env file"**
- Run `node setup.js` to generate configuration files
- Ensure `server/.env` exists

**Error: "Node.js is not installed"**
- Install Node.js from https://nodejs.org/
- Verify: `node --version`

### Server Issues

**Server won't start**
- Check if port 3000 is already in use
- Try changing PORT in `server/.env`

**CORS errors in browser console**
- Update `CORS_ORIGIN` in `server/.env`
- Restart server after changes

### Admin Panel Issues

**"Authentication failed" error**
- Verify you're using the correct `admin-credentials.json` file
- Ensure server is running
- Check server logs for authentication attempts

**Admin panel returns to login after refresh**
- This is expected behavior (security feature)
- You must re-upload credentials after every page refresh

**Can't upload credentials file**
- Ensure file is valid JSON
- Verify file contains `adminSecret` and `serverUrl` fields

### Client Issues

**"Game On" button doesn't appear**
- Admin must create a game first
- Check server is running
- Verify `docs/config.js` has correct SERVER_URL

**Can't register as player**
- Check if your IP is blocked (admin panel → Advanced Settings)
- Verify server connection in browser console
- Ensure game is in registration or active state

---

## 📚 Documentation

- [Real-Time Team Game Specification](specs/real-time-team-game-spec.md)
- [Secure Configuration Specification](specs/secure-configuration-spec.md)

---

## 🤝 Contributing

This is an open-source project for educational webinar demonstrations. Contributions welcome!

### Setup for Development

1. Fork the repository
2. Clone your fork
3. Run `node setup.js`
4. Make your changes
5. Test thoroughly
6. Submit pull request

### Development Workflow

```bash
# Start server with auto-reload
cd server
npm run dev

# Server restarts automatically on file changes
```

---

## 📄 License

MIT License - Feel free to use for your own webinars and presentations!

---

## 🙋 Support

**Issues**: https://github.com/avi-the-coach/dev-ai-gov-forum-open-repo/issues

**Documentation**: See `/specs` folder for detailed technical specifications

---

## 🎯 Webinar Demo Tips

### Before the Webinar

1. ✅ Run setup on production server
2. ✅ Test admin panel authentication
3. ✅ Test player registration flow
4. ✅ Verify GitHub Pages deployment
5. ✅ Keep `admin-credentials.json` file ready

### During the Webinar

1. 📺 Share client URL in chat
2. 🎮 Open admin panel (don't share screen until login complete)
3. 🔑 Upload credentials file (off-screen)
4. 📊 Share admin panel screen (uncheck "Advanced Settings" to hide IPs)
5. ▶️ Create game when ready
6. 🏁 Start game when participants are registered
7. 🎉 Let the competition begin!

### After the Webinar

1. 🛑 Finish or delete game
2. 📊 Screenshot final leaderboard
3. 🗑️ Clear player data if desired
4. 💾 Save server logs for analysis

---

**Built with ❤️ for AI development education**
