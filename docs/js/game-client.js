/**
 * Game Client
 * WebSocket client for real-time team game mode
 * Gracefully degrades if server unavailable - form continues working standalone
 */

class GameClient {
    constructor() {
        // Configuration
        // Detect if we're in local development (file:// or localhost)
        const isLocal = !window.location.hostname ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.protocol === 'file:';

        // Use GAME_CONFIG if available, otherwise fall back to localhost
        this.SERVER_URL = window.GAME_CONFIG?.SERVER_URL ||
                         (isLocal ? 'http://localhost:3000' : 'http://34.165.26.176:3001');

        // State
        this.connected = false;
        this.registered = false;
        this.uuid = null;
        this.team = null;
        this.playerName = null;
        this.socket = null;

        // Callbacks
        this.onGameStateChange = null;
        this.onLeaderboardUpdate = null;
        this.onTimerUpdate = null;
        this.onGameEnd = null;
        this.onRegistrationSuccess = null;
        this.onRegistrationError = null;

        // Try to connect
        this.connect();
    }

    /**
     * Connect to server
     */
    connect() {
        // Check if Socket.io is available
        if (typeof io === 'undefined') {
            console.log('Socket.io not loaded - game mode unavailable');
            return;
        }

        try {
            console.log(`Attempting to connect to game server: ${this.SERVER_URL}`);

            this.socket = io(this.SERVER_URL, {
                timeout: 5000,
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 1000
            });

            // Connection successful
            this.socket.on('connect', () => {
                console.log('Connected to game server');
                this.connected = true;

                // DO NOT auto-restore session - user must login on every page load
            });

            // Connection error
            this.socket.on('connect_error', (error) => {
                console.log('Game server unavailable - running in standalone mode');
                this.connected = false;
            });

            // Reconnection failed (after all attempts)
            this.socket.on('reconnect_failed', () => {
                console.log('Failed to reconnect to game server - logging out');

                // If player was registered, logout and reset
                if (this.registered && this.uuid) {
                    this.logoutLocal();
                    alert('לא ניתן להתחבר לשרת. המשחק הסתיים.\n\nהטופס עובד כרגיל במצב עצמאי.');
                    window.location.reload();
                }
            });

            // Game state changes
            this.socket.on('game_state', (data) => {
                console.log('Game state:', data);
                if (this.onGameStateChange) {
                    this.onGameStateChange(data);
                }
            });

            this.socket.on('game_state_change', (data) => {
                console.log('Game state changed:', data);
                if (this.onGameStateChange) {
                    this.onGameStateChange(data);
                }
            });

            // Leaderboard updates
            this.socket.on('leaderboard_update', (data) => {
                if (this.onLeaderboardUpdate) {
                    this.onLeaderboardUpdate(data);
                }
            });

            // Timer updates
            this.socket.on('timer_update', (data) => {
                if (this.onTimerUpdate) {
                    this.onTimerUpdate(data);
                }
            });

            // Game end
            this.socket.on('game_end', (data) => {
                if (this.onGameEnd) {
                    this.onGameEnd(data);
                }
            });

            // Registration responses
            this.socket.on('registration_success', (data) => {
                this.handleRegistrationSuccess(data);
            });

            this.socket.on('registration_error', (data) => {
                if (this.onRegistrationError) {
                    this.onRegistrationError(data.message);
                }
            });

            // Disconnection
            this.socket.on('disconnect', () => {
                console.log('Disconnected from game server');
                this.connected = false;

                // If player was registered/logged in to game, handle disconnection
                if (this.registered && this.uuid) {
                    console.log('Server disconnected - logging out of game mode');

                    // Clear local session
                    this.logoutLocal();

                    // Show message to user
                    alert('השרת התנתק. המשחק הסתיים.\n\nהטופס עובד כרגיל במצב עצמאי.');

                    // Reload page to reset UI to standalone form mode
                    window.location.reload();
                }
            });

            // Player deleted by admin
            this.socket.on('player_deleted', (data) => {
                console.log('Player deleted by admin:', data.message);

                // Clear local session
                this.logoutLocal();

                // Show message to user
                alert(data.message);

                // Reload page to reset UI
                window.location.reload();
            });

            // Scores and time reset (keep playing)
            this.socket.on('scores_reset', (data) => {
                console.log('Scores and time reset:', data.message);

                // Show message to user
                if (window.gameUI) {
                    window.gameUI.showWelcomeMessage(data.message);
                }
            });

            // Game reset with members deleted
            this.socket.on('game_reset_with_members', (data) => {
                console.log('Game reset with members:', data.message);

                // Clear local session
                this.logoutLocal();

                // Show message to user
                alert(data.message);

                // Reload page to reset UI
                window.location.reload();
            });

            // Game deleted completely
            this.socket.on('game_deleted', (data) => {
                console.log('Game deleted:', data.message);

                // Clear local session if registered
                if (this.registered) {
                    this.logoutLocal();
                }

                // Show message to user
                alert(data.message);

                // Reload page to reset UI
                window.location.reload();
            });

            // Session validation events removed - auto-login disabled
            // User must register/login with name+password on every page load

        } catch (error) {
            console.log('Game mode not available:', error);
            this.connected = false;
        }
    }

    /**
     * Register player for game
     */
    registerPlayer(name, password) {
        if (!this.connected || !this.socket) {
            if (this.onRegistrationError) {
                this.onRegistrationError('Not connected to game server');
            }
            return;
        }

        console.log(`Registering player: ${name}`);
        this.socket.emit('register_player', { name, password });
    }

    /**
     * Handle successful registration
     */
    handleRegistrationSuccess(data) {
        console.log('Registration successful:', data);

        this.registered = true;
        this.uuid = data.uuid;
        this.team = data.team;
        this.playerName = data.name || 'Player';

        // Save session to localStorage
        this.saveSession(data);

        if (this.onRegistrationSuccess) {
            this.onRegistrationSuccess(data);
        }
    }

    /**
     * Submit score to server
     */
    submitScore(points) {
        if (!this.isActive()) {
            console.log(`Cannot submit score - Game not active. Connected: ${this.connected}, Registered: ${this.registered}, UUID: ${this.uuid}`);
            return false;
        }

        console.log(`✅ Submitting score: ${points} points for player ${this.playerName} (UUID: ${this.uuid})`);

        this.socket.emit('score_update', {
            uuid: this.uuid,
            points: points,
            timestamp: Date.now()
        });

        return true;
    }

    /**
     * Check if game mode is active
     */
    isActive() {
        return this.connected && this.registered && this.uuid !== null;
    }

    /**
     * Check if connected to server
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Save session to localStorage
     * NOTE: Not used - UUID should never be stored in localStorage
     * User must login with name+password on every page load
     */
    saveSession(data) {
        // Session persistence disabled - user must login each time
        console.log('Session persistence disabled - login required on each page load');
    }

    /**
     * Restore session from localStorage
     * DISABLED - User must login with name+password on every page load
     */
    restoreSession() {
        // Session restoration disabled - user must login each time
        console.log('Auto-login disabled - user must register/login on each page load');
    }

    /**
     * Logout locally (clear client session only, keep server data)
     */
    logoutLocal() {
        console.log('Logging out locally (server data preserved)');

        try {
            localStorage.removeItem('game_uuid');
            localStorage.removeItem('game_team');
            localStorage.removeItem('game_player_name');
        } catch (error) {
            console.log('Could not clear local session:', error);
        }

        this.registered = false;
        this.uuid = null;
        this.team = null;
        this.playerName = null;
    }

    /**
     * Clear session (deprecated - use logoutLocal instead)
     */
    clearSession() {
        this.logoutLocal();
    }

    /**
     * Get player info
     */
    getPlayerInfo() {
        return {
            uuid: this.uuid,
            team: this.team,
            name: this.playerName,
            registered: this.registered
        };
    }
}

// Initialize game client globally
window.gameClient = new GameClient();
