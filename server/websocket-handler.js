/**
 * WebSocket Handler
 * Manages Socket.io events and communication between clients and server
 */

class WebSocketHandler {
    constructor(io, gameManager, playerManager, config) {
        this.io = io;
        this.gameManager = gameManager;
        this.playerManager = playerManager;
        this.config = config;

        // Set up game manager callbacks
        this.gameManager.setTimerTickCallback((timeRemaining) => {
            this.broadcastTimerUpdate(timeRemaining);
        });

        this.gameManager.setGameEndCallback(() => {
            this.broadcastGameEnd();
        });
    }

    /**
     * Handle new socket connection
     */
    handleConnection(socket) {
        // Send current game state to newly connected client
        socket.emit('game_state', {
            state: this.gameManager.getState(),
            timeRemaining: this.gameManager.getFullState().timeRemaining,
            duration: this.gameManager.getFullState().duration
        });

        // Handle player registration
        socket.on('register_player', async (data) => {
            await this.handlePlayerRegistration(socket, data);
        });

        // Handle session validation
        socket.on('validate_session', (data) => {
            this.handleSessionValidation(socket, data);
        });

        // Handle score updates
        socket.on('score_update', (data) => {
            this.handleScoreUpdate(socket, data);
        });

        // Handle admin commands
        socket.on('admin_command', (data) => {
            this.handleAdminCommand(socket, data);
        });

        // Handle admin authentication
        socket.on('admin_auth', (data) => {
            this.handleAdminAuth(socket, data);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
    }

    /**
     * Handle session validation
     * Check if a stored UUID still exists on the server
     */
    handleSessionValidation(socket, data) {
        const { uuid } = data;

        if (!uuid) {
            socket.emit('session_invalid', { message: 'No UUID provided' });
            return;
        }

        // Check if player exists
        const player = this.playerManager.getPlayer(uuid);

        if (player) {
            // Player exists, session is valid
            console.log(`Session validated for player: ${player.name} (${player.team})`);

            // Connect player's socket
            this.playerManager.connectPlayer(uuid, socket.id);

            socket.emit('session_valid', {
                uuid: player.uuid,
                team: player.team,
                score: player.score,
                name: player.name
            });

            // Broadcast updated leaderboard
            this.broadcastLeaderboard();
        } else {
            // Player doesn't exist (was deleted), session invalid
            console.log(`Session validation failed for UUID: ${uuid}`);
            socket.emit('session_invalid', { message: 'Player no longer exists' });
        }
    }

    /**
     * Handle player registration
     */
    async handlePlayerRegistration(socket, data) {
        const { name, password } = data;

        if (!name || !password) {
            socket.emit('registration_error', { message: 'Name and password required' });
            return;
        }

        // Get client IP address
        const ipAddress = socket.handshake.address || socket.conn.remoteAddress || 'unknown';

        const result = await this.playerManager.registerPlayer(name, password, ipAddress);

        if (!result.success) {
            socket.emit('registration_error', { message: result.message });
            return;
        }

        // Connect player's socket
        this.playerManager.connectPlayer(result.uuid, socket.id);

        // Send registration success to client
        socket.emit('registration_success', {
            uuid: result.uuid,
            team: result.team,
            score: result.score,
            message: result.message,
            isReturning: result.isReturning
        });

        console.log(`Player registered via socket: ${name} (${result.team})`);

        // Broadcast updated leaderboard to all clients
        this.broadcastLeaderboard();

        // Send updated leaderboard to admin if connected
        this.broadcastAdminUpdate();
    }

    /**
     * Handle score update from player
     */
    handleScoreUpdate(socket, data) {
        const { uuid, points } = data;

        // Validate game is active
        if (!this.gameManager.isScoringEnabled()) {
            socket.emit('score_error', { message: 'Scoring not active' });
            return;
        }

        // Validate data
        if (!uuid || typeof points !== 'number') {
            socket.emit('score_error', { message: 'Invalid score data' });
            return;
        }

        // Add score
        const result = this.playerManager.addScore(uuid, points);

        if (!result.success) {
            socket.emit('score_error', { message: result.message });
            return;
        }

        // Broadcast updated leaderboard to all clients
        this.broadcastLeaderboard();

        // Send updated leaderboard to admin
        this.broadcastAdminUpdate();
    }

    /**
     * Handle admin commands
     */
    handleAdminCommand(socket, data) {
        const { adminSecret, command, payload } = data;

        // Validate admin secret on EVERY command
        if (!adminSecret || adminSecret !== this.config.ADMIN_SECRET) {
            socket.emit('admin_command_result', {
                success: false,
                message: 'Unauthorized - Invalid credentials'
            });
            console.warn(`⚠️ Unauthorized admin command attempt from ${socket.id}`);
            return;
        }

        console.log(`Admin command received: ${command}`);

        let result;

        switch (command) {
            case 'create_game':
                result = this.gameManager.createGame(payload?.duration);
                if (result.success) {
                    this.broadcastGameStateChange();
                }
                break;

            case 'start_game':
                // Update duration if provided
                if (payload?.duration) {
                    this.gameManager.setDuration(payload.duration);
                }
                result = this.gameManager.startGame();
                if (result.success) {
                    // Reset all scores
                    this.playerManager.resetScores();
                    this.broadcastGameStateChange();
                    this.broadcastLeaderboard();
                }
                break;

            case 'stop_game':
                result = this.gameManager.stopGame();
                if (result.success) {
                    this.broadcastGameStateChange();
                }
                break;

            case 'reset_game':
                result = this.gameManager.resetGame();
                if (result.success) {
                    this.playerManager.resetScores();
                    this.broadcastGameStateChange();
                    this.broadcastLeaderboard();
                }
                break;

            case 'reset_scores_and_time':
                // Update duration if provided (allow during active game for reset purposes)
                if (payload?.duration) {
                    this.gameManager.setDuration(payload.duration, true);
                }

                result = this.gameManager.resetScoresAndTime();
                if (result.success) {
                    // Reset all player scores
                    this.playerManager.resetScores();

                    // Notify only connected and registered players about the reset
                    this.notifyLoggedInPlayers('scores_reset', {
                        message: 'הניקוד והזמן אופסו! 5 שניות התחממות לפני תחילת המשחק...',
                        warmupTime: result.warmupTime
                    });

                    // Broadcast updated state
                    this.broadcastGameStateChange();
                    this.broadcastLeaderboard();
                }
                break;

            case 'delete_game':
                // Delete game completely (logs out all players, removes game)
                // This is: delete all players + reset game to idle
                const deletePlayersResult = this.playerManager.deleteAllPlayers();
                result = this.gameManager.deleteGame();

                if (result.success) {
                    // Notify all connected players (same as reset_game_with_members)
                    deletePlayersResult.connectedSocketIds.forEach(socketId => {
                        const playerSocket = this.io.sockets.sockets.get(socketId);
                        if (playerSocket) {
                            playerSocket.emit('game_reset_with_members', {
                                message: 'המשחק הוסר על ידי המנהל.'
                            });
                        }
                    });

                    result = {
                        success: true,
                        message: `Game deleted with all ${deletePlayersResult.playerCount} members removed`
                    };

                    // Broadcast updated state (all clients need to know game state changed)
                    this.broadcastGameStateChange();
                    this.broadcastLeaderboard();
                }
                break;

            case 'reset_game_with_members':
                // Reset game with all members (logs out all players, creates new game)
                // This is: delete_game + create_game

                // Step 1: Delete game completely (uses delete_game logic)
                const deleteResult = this.playerManager.deleteAllPlayers();
                const deleteGameResult = this.gameManager.deleteGame();

                // Step 2: Create new game with specified duration
                const createResult = this.gameManager.createGame(payload?.duration);

                if (deleteGameResult.success && createResult.success) {
                    // Notify all connected players
                    deleteResult.connectedSocketIds.forEach(socketId => {
                        const playerSocket = this.io.sockets.sockets.get(socketId);
                        if (playerSocket) {
                            playerSocket.emit('game_reset_with_members', {
                                message: 'המשחק אופס במלואו על ידי המנהל. כל המשתתפים הוסרו. ניתן להירשם מחדש.'
                            });
                        }
                    });

                    result = {
                        success: true,
                        message: `Game reset with all ${deleteResult.playerCount} members removed and new game created`
                    };

                    // Broadcast updated state
                    this.broadcastGameStateChange();
                    this.broadcastLeaderboard();
                }
                break;

            case 'set_duration':
                result = this.gameManager.setDuration(payload?.duration);
                if (result.success) {
                    this.broadcastGameStateChange();
                }
                break;

            case 'delete_player':
                result = this.playerManager.deletePlayer(payload?.uuid);
                if (result.success) {
                    // If player is currently connected, notify them and disconnect
                    if (result.socketId) {
                        const playerSocket = this.io.sockets.sockets.get(result.socketId);
                        if (playerSocket) {
                            playerSocket.emit('player_deleted', {
                                message: 'המשתמש שלך הוסר מהמשחק על ידי המנהל. כתובת ה-IP שלך נחסמה.'
                            });
                            // Give client time to show message before disconnecting
                            setTimeout(() => {
                                playerSocket.disconnect(true);
                            }, 2000);
                        }
                    }
                    // Broadcast updated leaderboard to all clients
                    this.broadcastLeaderboard();
                }
                break;

            case 'unblock_ip':
                result = this.playerManager.unblockIP(payload?.ipAddress);
                break;

            default:
                result = { success: false, message: 'Unknown command' };
        }

        // Send result back to admin
        socket.emit('admin_command_result', result);

        // Send updated admin dashboard
        this.broadcastAdminUpdate();
    }

    /**
     * Handle admin authentication
     */
    handleAdminAuth(socket, data) {
        const { adminSecret } = data;

        if (!adminSecret) {
            socket.emit('admin_auth_error', {
                message: 'No credentials provided'
            });
            console.warn(`Admin auth attempt with no credentials from ${socket.id}`);
            return;
        }

        if (adminSecret === this.config.ADMIN_SECRET) {
            socket.emit('admin_auth_success', {
                message: 'Admin authenticated'
            });

            // Mark socket as admin
            socket.isAdmin = true;

            console.log(`✅ Admin authenticated: ${socket.id}`);

            // Send full admin dashboard data
            this.sendAdminDashboard(socket);
        } else {
            socket.emit('admin_auth_error', {
                message: 'Invalid admin credentials'
            });
            console.warn(`⚠️ Invalid admin auth attempt from ${socket.id}`);
        }
    }

    /**
     * Handle socket disconnection
     */
    handleDisconnect(socket) {
        const uuid = this.playerManager.disconnectPlayer(socket.id);
        if (uuid) {
            console.log(`Player disconnected: ${socket.id}`);
        }
    }

    /**
     * Broadcast leaderboard to all regular clients
     */
    broadcastLeaderboard() {
        const leaderboard = this.playerManager.getLeaderboard();
        this.io.emit('leaderboard_update', leaderboard);
    }

    /**
     * Broadcast game state change to all clients
     */
    broadcastGameStateChange() {
        const gameState = this.gameManager.getFullState();
        this.io.emit('game_state_change', {
            state: gameState.state,
            timeRemaining: gameState.timeRemaining,
            duration: gameState.duration
        });
    }

    /**
     * Broadcast timer update to all clients
     */
    broadcastTimerUpdate(timeRemaining) {
        this.io.emit('timer_update', {
            timeRemaining,
            formattedTime: this.gameManager.getFormattedTime(),
            inWarmup: this.gameManager.isInWarmup(),
            warmupTimeRemaining: this.gameManager.getWarmupTimeRemaining()
        });
    }

    /**
     * Broadcast game end to all clients
     */
    broadcastGameEnd() {
        const leaderboard = this.playerManager.getLeaderboard();
        const winner = leaderboard.red_team.total > leaderboard.green_team.total
            ? 'red'
            : leaderboard.green_team.total > leaderboard.red_team.total
            ? 'green'
            : 'tie';

        this.io.emit('game_end', {
            winner,
            leaderboard
        });

        // Broadcast state change to update admin panel buttons
        this.broadcastGameStateChange();

        // Update admin dashboard
        this.broadcastAdminUpdate();
    }

    /**
     * Send admin dashboard data to specific socket
     */
    sendAdminDashboard(socket) {
        const data = {
            gameState: this.gameManager.getFullState(),
            leaderboard: this.playerManager.getAdminLeaderboard(),
            teamStats: this.playerManager.getTeamStats(),
            playerCount: this.playerManager.getPlayerCount(),
            blockedIPs: this.playerManager.getBlockedIPs()
        };

        socket.emit('admin_dashboard', data);
    }

    /**
     * Broadcast admin update to all admin clients
     */
    broadcastAdminUpdate() {
        const data = {
            gameState: this.gameManager.getFullState(),
            leaderboard: this.playerManager.getAdminLeaderboard(),
            teamStats: this.playerManager.getTeamStats(),
            playerCount: this.playerManager.getPlayerCount(),
            blockedIPs: this.playerManager.getBlockedIPs()
        };

        // Send to all admin sockets
        this.io.sockets.sockets.forEach((socket) => {
            if (socket.isAdmin) {
                socket.emit('admin_update', data);
            }
        });
    }

    /**
     * Notify only logged-in players (connected and registered)
     * Does not notify clients who are just browsing or not logged into the game
     */
    notifyLoggedInPlayers(eventName, data) {
        // Get all players
        for (const player of this.playerManager.players.values()) {
            // Only notify if player is currently connected (has socketId)
            if (player.socketId && player.connected) {
                const socket = this.io.sockets.sockets.get(player.socketId);
                if (socket) {
                    socket.emit(eventName, data);
                }
            }
        }
    }
}

module.exports = WebSocketHandler;
