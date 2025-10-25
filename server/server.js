/**
 * Webinar Game Server
 * Real-time team competition with WebSocket support
 */

// Load environment variables from .env file
require('dotenv').config();

// Validate required environment variables
if (!process.env.ADMIN_SECRET) {
    console.error('\n❌ ERROR: ADMIN_SECRET not found in .env file');
    console.error('Please run: node setup.js\n');
    process.exit(1);
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config');
const GameManager = require('./game-manager');
const PlayerManager = require('./player-manager');
const WebSocketHandler = require('./websocket-handler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize managers
const gameManager = new GameManager();
const playerManager = new PlayerManager();
const wsHandler = new WebSocketHandler(io, gameManager, playerManager, config);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        gameState: gameManager.getState(),
        playerCount: playerManager.getPlayerCount(),
        timestamp: new Date().toISOString()
    });
});

// Get game status (for debugging)
app.get('/status', (req, res) => {
    res.json({
        game: gameManager.getFullState(),
        teams: playerManager.getTeamStats(),
        leaderboard: playerManager.getLeaderboard()
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    wsHandler.handleConnection(socket);
});

// Start server
server.listen(config.PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   Webinar Game Server                          ║
║   Server running on port ${config.PORT}                ║
║   Environment: ${process.env.NODE_ENV || 'development'}                   ║
╚════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    gameManager.stopGame();
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});
