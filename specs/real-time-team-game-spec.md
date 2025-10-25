# Real-Time Team Game Server Specification

**Project**: Webinar Registration Form - Live Team Competition Mode
**Purpose**: Interactive demonstration for "AI Development Using AI" webinar
**Repository**: https://github.com/avi-the-coach/dev-ai-gov-forum-open-repo
**Date**: 2025-01-24
**Status**: Implemented

---

## Overview

Dual-mode webinar registration application supporting both standard registration and real-time competitive team game. Participants compete in Red vs Green teams by blasting logos and alien spaceships, with live scoring synchronized across all clients.

## ⚠️ CRITICAL: Progressive Enhancement

**The form MUST work in all scenarios:**

### Standalone Mode (Always Works)
- Form works without JavaScript, without server, without game mode
- All interactive elements: floating logos, aliens, fireworks, speech bubbles
- Local scoring in top-left corner
- Form submission via Gmail/WhatsApp/Outlook
- **Zero dependencies on server availability**

### Game Mode (Optional Layer)
- Opt-in only - user must actively join
- Ignoring "Game On" → form continues standalone
- Server unavailable → form continues standalone
- **Progressive enhancement** over working form

---

## Game Concept

### Team Competition
- **Red Team** (left) vs **Green Team** (right)
- Auto-balanced team assignment
- All participants blast across entire screen
- Real-time score synchronization
- Live dual-column leaderboards

### Game States
1. **idle** - No game exists
2. **registration** - Game created, players can join
3. **practice** - Not used (players can join anytime)
4. **active** - Timer running, scoring enabled
5. **ended** - Final scores frozen

---

## Authentication & Session Management

### Player Registration (Per Page Load)

**Critical Rule**: **NO auto-login on page refresh**
- UUID **never saved to localStorage**
- Every page load/refresh requires login with name+password
- Existing players: authenticate with credentials → return existing UUID
- New players: register with credentials → create new UUID

**Flow**:
1. Player clicks "Game On" indicator
2. Popup opens with Name + Password fields
3. Submit registration
4. Server authenticates or creates new player
5. UUID stored in **server memory only**

**Security**:
- Passwords hashed with bcrypt (10 rounds)
- UUIDs never displayed to regular clients
- In-memory storage only (no persistence)
- IP addresses tracked for all players

### IP Tracking & Blocking

**Implementation**:
- Server captures IP: `socket.handshake.address || socket.conn.remoteAddress`
- Stored in player object: `{ uuid, name, team, score, ipAddress, ... }`
- Admin panel displays IP next to player name: `"Alice (192.168.1.105)"`

**Blocking System**:
- Delete player (🗑️) → **auto-blocks their IP**
- Blocked IPs cannot re-register
- Error message: "Your IP address has been blocked by the administrator"
- Admin can unblock IPs from "Blocked IP Addresses" section

### Server Disconnect Handling

**Client Behavior**:
- Server disconnects → auto-logout if logged in
- Alert shown (Hebrew): "השרת התנתק. המשחק הסתיים. הטופס עובד כרגיל במצב עצמאי."
- Page reloads → returns to standalone form mode
- Reconnection attempts: 3 tries, 1 second apart

**Admin Panel Behavior**:
- Server disconnects → **all controls disabled**
- Buttons: Create, Start, Finish, Delete - all grayed out
- Duration selector disabled
- Status: `⚠️ Disconnected from server` (red)

---

## Game Timer & Duration

### Warmup Period
- **5-second countdown** before game starts: `-00:05` → `-00:01`
- Applies to both:
  - First game start (after "Create" → "Start")
  - Score reset & restart

### Duration Selection
- Admin selects duration: 30s, 60s, 90s, 120s, 300s
- Timer display updates **in real-time** when selector changes
- Selector **enabled** when: idle, registration, ended
- Selector **disabled** when: active (game running)

### Game Start
- Admin clicks "Start Game"
- Server receives selected duration
- Timer starts with 5-second warmup
- Example: 60s selected → `-00:05` → `01:00` → `00:00`

---

## Admin Panel

### Authentication
- Hardcoded UUID: `dev-admin-uuid-12345` (development)
- Production: environment variable

### Game Controls

**Create Game**:
- Initializes game with selected duration
- State: `idle` → `registration`
- "Game On" indicator appears for clients

**Start Game**:
- Resets all scores to zero
- Starts 5-second warmup, then countdown
- State: `registration` → `active`

**Finish Game**:
- Ends game immediately
- State: `active` → `ended`
- **Disabled** when: idle, registration, ended
- **Enabled** only when: active

**Reset Scores & Restart Timer**:
- Keeps all players registered
- Resets scores to zero
- Restarts with 5-second warmup
- Available when: active or ended

**Reset Game + Delete All Members**:
- Deletes all players (logs them out)
- Returns to registration state
- Clears blocklist

**Delete Game Completely**:
- Removes game entirely
- All clients return to form view
- State: `ended` → `idle`

### Dashboard
- Connection status indicator
- Game state badge (idle/registration/active/ended)
- Player count by team (Red/Green/Total)
- Team scores (matches client styling)
- Game timer with color coding
- Dual-column leaderboards (Red vs Green)
- IP addresses displayed next to player names
- Delete button (🗑️) per player
- Blocked IP Addresses section with Unblock buttons

### Connection-Aware UI
- All controls disabled when server disconnected
- Duration selector follows same rules
- Real-time updates via WebSocket

---

## Server Architecture

### Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **Storage**: In-memory (no database)

### Structure
```
/server
├── server.js              # Entry point, Express, Socket.io
├── config.js              # Configuration constants
├── game-manager.js        # Game state, timer, lifecycle
├── player-manager.js      # Registration, auth, scoring, IP blocking
└── websocket-handler.js   # Socket.io events, broadcasting
```

### Key Features

**Game Manager** (`game-manager.js`):
- State machine: idle → registration → active → ended
- Timer with 5-second warmup
- Callbacks for timer tick and game end

**Player Manager** (`player-manager.js`):
- Registration with bcrypt password hashing
- Team auto-balancing (assign to smaller team)
- IP address tracking and blocking
- Score management with rate limiting (max 10 updates/second)
- Leaderboard generation

**WebSocket Handler** (`websocket-handler.js`):
- Player events: register, score_update, disconnect
- Admin events: admin_command with payload
- Broadcasting: leaderboard, game state, timer updates
- Admin dashboard data (includes blocked IPs)

### Admin Commands
- `create_game` / `reset_game_with_members` (with duration)
- `start_game` (with duration)
- `stop_game`
- `reset_scores_and_time` (with duration)
- `delete_game`
- `delete_player` (auto-blocks IP)
- `unblock_ip`

---

## Client-Side Implementation

### File Structure
```
/docs
├── js/
│   ├── game-client.js      # WebSocket management, NO auto-login
│   ├── game-ui.js          # UI transformation, leaderboards
│   ├── form-handler.js     # Existing (unchanged)
│   ├── floating-bg.js      # Existing (minimal changes)
│   └── alien-spaceship.js  # Existing (minimal changes)
├── css/
│   ├── game-styles.css     # Game mode styling
│   └── styles.css          # Existing (unchanged)
└── webinar-registration-ai-in-dev-v2.html
```

### Game Client (`game-client.js`)

**Key Changes from Original Plan**:
- **NO localStorage for UUID** (security fix)
- **NO auto-restore session** (every page load requires login)
- Server disconnect → auto-logout → page reload
- Reconnection failed → same behavior

**Connection Settings**:
```javascript
io(SERVER_URL, {
    timeout: 5000,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000
});
```

### Integration Points

**Logo Explosion** (`floating-bg.js`):
```javascript
// Always local scoring
logoScore += 500;

// Game mode scoring (only if registered)
if (window.gameClient?.isActive()) {
    window.gameClient.submitScore(500);
}
```

**Alien Explosion** (`alien-spaceship.js`):
```javascript
// Always local scoring
logoScore += 1000;

// Game mode scoring (only if registered)
if (window.gameClient?.isActive()) {
    window.gameClient.submitScore(1000);
}
```

---

## Security

### Password Security
- bcrypt hashing with 10 rounds
- Passwords never logged or transmitted unencrypted

### Rate Limiting
- Max 10 score updates per second per player
- Server-side throttle (100ms between broadcasts)

### IP Blocking
- Automatic on player deletion
- Persistent until server restart
- Admin can unblock

### Input Validation
- Name length limits
- HTML sanitization (remove `<>`)
- UUID validation on all operations

---

## Messages (Hebrew)

### Player Deleted
"המשתמש שלך הוסר מהמשחק על ידי המנהל. כתובת ה-IP שלך נחסמה."

### Server Disconnected
"השרת התנתק. המשחק הסתיים. הטופס עובד כרגיל במצב עצמאי."

### Reconnection Failed
"לא ניתן להתחבר לשרת. המשחק הסתיים. הטופס עובד כרגיל במצב עצמאי."

### Scores Reset
"הניקוד והזמן אופסו! 5 שניות התחממות לפני תחילת המשחק..."

---

## Production Safety

**Never Breaks**:
- ✅ Standalone form registration
- ✅ Local logo/alien blasting
- ✅ Form field submission
- ✅ All visual elements

**Optional Features**:
- 🎮 Game mode (requires server + user registration)
- 🎮 Team competition
- 🎮 Real-time leaderboards

**Graceful Degradation**:
- Server down → standalone mode
- Connection lost → auto-logout → standalone mode
- Registration failed → error shown, form works

---

## Key Implementation Details

### Timer Display
- Shows selected duration on game creation
- Updates in real-time when duration selector changes
- Disabled when game active
- Format: `MM:SS` or `-MM:SS` (warmup)

### Admin Button States
| State | Create | Start | Finish | Delete | Duration |
|-------|--------|-------|--------|--------|----------|
| idle | ✅ | ❌ | ❌ | ❌ | ✅ |
| registration | ✅ | ✅ | ❌ | ✅ | ✅ |
| active | ✅ | ✅ | ✅ | ✅ | ❌ |
| ended | ✅ | ✅ | ❌ | ✅ | ✅ |
| **disconnected** | **❌** | **❌** | **❌** | **❌** | **❌** |

### Session Management Rules
1. No auto-login on page refresh
2. UUID only in server memory
3. Every page load requires login
4. Server disconnect = auto-logout
5. IP tracked for all registrations

---

## Repository

**Public** (GitHub Pages):
- `/docs` - Frontend client files
- `/specs` - Design documentation

**Private** (Local only):
- `admin-panel.html` - Admin interface

**Deployment**:
- Frontend: GitHub Pages (static)
- Backend: Google Cloud Platform (planned)
- Current: Local development (localhost:3000)

---

**Document Status**: Accurate - Reflects Actual Implementation
**Last Updated**: 2025-01-25
