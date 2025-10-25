/**
 * Player Manager
 * Handles player registration, authentication, team assignment, and scoring
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

class PlayerManager {
    constructor() {
        // Map<uuid, Player>
        this.players = new Map();

        // Map<name, uuid> for quick name lookup
        this.nameToUuid = new Map();

        // Team organization
        this.teams = {
            red: new Set(),
            green: new Set()
        };

        // Blocked IP addresses (Set for O(1) lookup)
        this.blockedIPs = new Set();
    }

    /**
     * Register a new player or authenticate existing player
     * @param {string} name - Player name
     * @param {string} password - Player password
     * @param {string} ipAddress - Client IP address (optional)
     * @returns {Object} { success, uuid, team, message, score }
     */
    async registerPlayer(name, password, ipAddress = null) {
        // Check if IP is blocked
        if (ipAddress && this.blockedIPs.has(ipAddress)) {
            console.log(`Blocked IP attempted registration: ${ipAddress}`);
            return { success: false, message: 'Your IP address has been blocked by the administrator' };
        }

        // Validate input
        if (!name || !password) {
            return { success: false, message: 'Name and password are required' };
        }

        if (name.length > config.MAX_NAME_LENGTH) {
            return { success: false, message: `Name too long (max ${config.MAX_NAME_LENGTH} characters)` };
        }

        if (password.length > config.MAX_PASSWORD_LENGTH) {
            return { success: false, message: `Password too long (max ${config.MAX_PASSWORD_LENGTH} characters)` };
        }

        // Sanitize name (remove HTML, trim)
        const sanitizedName = this._sanitizeName(name);

        // Check if player exists
        if (this.nameToUuid.has(sanitizedName)) {
            // Existing player - authenticate
            const uuid = this.nameToUuid.get(sanitizedName);
            const player = this.players.get(uuid);

            const isValid = await bcrypt.compare(password, player.passwordHash);

            if (!isValid) {
                return { success: false, message: 'Incorrect password' };
            }

            // Return existing player data
            return {
                success: true,
                uuid: player.uuid,
                team: player.team,
                score: player.score,
                message: `ברוך שובך ${player.name}, לצוות ה${this._getTeamDisplayName(player.team)}! המשך לצבור נקודות!`,
                isReturning: true
            };
        }

        // New player - register
        const uuid = uuidv4();
        const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
        const team = this._assignTeam();

        const player = {
            uuid,
            name: sanitizedName,
            passwordHash,
            team,
            score: 0,
            connected: false,
            socketId: null,
            ipAddress: ipAddress,
            registeredAt: Date.now(),
            lastScoreUpdate: 0
        };

        // Store player
        this.players.set(uuid, player);
        this.nameToUuid.set(sanitizedName, uuid);
        this.teams[team].add(uuid);

        console.log(`New player registered: ${sanitizedName} (${team} team) - UUID: ${uuid}`);

        return {
            success: true,
            uuid,
            team,
            score: 0,
            message: `ברוכים הבאים ${sanitizedName}, לצוות ה${this._getTeamDisplayName(team)}! המטרה שלך היא לעזור לצוות שלך לצבור כמה שיותר נקודות - יותר מהצוות ה${this._getOppositeTeamDisplayName(team)}.`,
            isReturning: false
        };
    }

    /**
     * Connect a player's socket
     */
    connectPlayer(uuid, socketId) {
        const player = this.players.get(uuid);
        if (player) {
            player.connected = true;
            player.socketId = socketId;
            console.log(`Player connected: ${player.name} (${socketId})`);
            return true;
        }
        return false;
    }

    /**
     * Disconnect a player's socket
     */
    disconnectPlayer(socketId) {
        for (const player of this.players.values()) {
            if (player.socketId === socketId) {
                player.connected = false;
                player.socketId = null;
                console.log(`Player disconnected: ${player.name}`);
                return player.uuid;
            }
        }
        return null;
    }

    /**
     * Add score to a player
     */
    addScore(uuid, points) {
        const player = this.players.get(uuid);
        if (!player) {
            return { success: false, message: 'Player not found' };
        }

        // Rate limiting check
        const now = Date.now();
        const timeSinceLastUpdate = now - player.lastScoreUpdate;
        if (timeSinceLastUpdate < (1000 / config.MAX_SCORE_UPDATES_PER_SECOND)) {
            return { success: false, message: 'Score updates too frequent' };
        }

        player.score += points;
        player.lastScoreUpdate = now;

        console.log(`Score added: ${player.name} +${points} (total: ${player.score})`);

        return {
            success: true,
            player: {
                uuid: player.uuid,
                name: player.name,
                team: player.team,
                score: player.score
            }
        };
    }

    /**
     * Get leaderboard for both teams
     */
    getLeaderboard() {
        const redPlayers = [];
        const greenPlayers = [];

        for (const uuid of this.teams.red) {
            const player = this.players.get(uuid);
            redPlayers.push({
                name: player.name,
                score: player.score
            });
        }

        for (const uuid of this.teams.green) {
            const player = this.players.get(uuid);
            greenPlayers.push({
                name: player.name,
                score: player.score
            });
        }

        // Sort by score descending
        redPlayers.sort((a, b) => b.score - a.score);
        greenPlayers.sort((a, b) => b.score - a.score);

        // Calculate totals
        const redTotal = redPlayers.reduce((sum, p) => sum + p.score, 0);
        const greenTotal = greenPlayers.reduce((sum, p) => sum + p.score, 0);

        return {
            red_team: {
                total: redTotal,
                players: redPlayers
            },
            green_team: {
                total: greenTotal,
                players: greenPlayers
            }
        };
    }

    /**
     * Get admin leaderboard (includes UUIDs)
     */
    getAdminLeaderboard() {
        const redPlayers = [];
        const greenPlayers = [];

        for (const uuid of this.teams.red) {
            const player = this.players.get(uuid);
            redPlayers.push({
                uuid: player.uuid,
                name: player.name,
                score: player.score,
                connected: player.connected,
                ipAddress: player.ipAddress
            });
        }

        for (const uuid of this.teams.green) {
            const player = this.players.get(uuid);
            greenPlayers.push({
                uuid: player.uuid,
                name: player.name,
                score: player.score,
                connected: player.connected,
                ipAddress: player.ipAddress
            });
        }

        // Sort by score descending
        redPlayers.sort((a, b) => b.score - a.score);
        greenPlayers.sort((a, b) => b.score - a.score);

        const redTotal = redPlayers.reduce((sum, p) => sum + p.score, 0);
        const greenTotal = greenPlayers.reduce((sum, p) => sum + p.score, 0);

        return {
            red_team: {
                total: redTotal,
                count: redPlayers.length,
                players: redPlayers
            },
            green_team: {
                total: greenTotal,
                count: greenPlayers.length,
                players: greenPlayers
            }
        };
    }

    /**
     * Reset all scores to zero
     */
    resetScores() {
        for (const player of this.players.values()) {
            player.score = 0;
        }
        console.log('All scores reset to zero');
    }

    /**
     * Get player count
     */
    getPlayerCount() {
        return this.players.size;
    }

    /**
     * Get team statistics
     */
    getTeamStats() {
        return {
            red: this.teams.red.size,
            green: this.teams.green.size,
            total: this.players.size
        };
    }

    /**
     * Get player by UUID (for admin)
     */
    getPlayer(uuid) {
        const player = this.players.get(uuid);
        if (!player) return null;

        return {
            uuid: player.uuid,
            name: player.name,
            team: player.team,
            score: player.score,
            connected: player.connected,
            ipAddress: player.ipAddress,
            registeredAt: player.registeredAt
        };
    }

    /**
     * Delete a player completely (admin only)
     * Removes player from all data structures, their score is subtracted from team total
     * Auto-blocks the player's IP address
     * @param {string} uuid - Player UUID
     * @returns {Object} { success, socketId, playerName, message }
     */
    deletePlayer(uuid) {
        const player = this.players.get(uuid);
        if (!player) {
            return { success: false, message: 'Player not found' };
        }

        // Store info before deletion
        const playerName = player.name;
        const playerSocketId = player.socketId;
        const playerTeam = player.team;
        const playerIP = player.ipAddress;

        // Remove from all data structures
        this.players.delete(uuid);
        this.nameToUuid.delete(player.name);
        this.teams[player.team].delete(uuid);

        // Auto-block the player's IP address
        if (playerIP && playerIP !== 'unknown') {
            this.blockedIPs.add(playerIP);
            console.log(`Player deleted and IP blocked: ${playerName} (${playerTeam} team) - IP: ${playerIP}`);
        } else {
            console.log(`Player deleted by admin: ${playerName} (${playerTeam} team) - UUID: ${uuid}`);
        }

        return {
            success: true,
            socketId: playerSocketId,
            playerName: playerName,
            message: `Player ${playerName} deleted and IP blocked successfully`
        };
    }

    /**
     * Delete all players (admin only - for full game reset)
     * @returns {Object} { success, connectedSocketIds, message }
     */
    deleteAllPlayers() {
        const connectedSocketIds = [];

        // Collect all connected socket IDs
        for (const player of this.players.values()) {
            if (player.socketId) {
                connectedSocketIds.push(player.socketId);
            }
        }

        const playerCount = this.players.size;

        // Clear all data structures
        this.players.clear();
        this.nameToUuid.clear();
        this.teams.red.clear();
        this.teams.green.clear();

        console.log(`All players deleted by admin (${playerCount} players removed)`);

        return {
            success: true,
            connectedSocketIds: connectedSocketIds,
            playerCount: playerCount,
            message: `All ${playerCount} players deleted successfully`
        };
    }

    // Private methods

    /**
     * Assign team with balancing
     */
    _assignTeam() {
        const redCount = this.teams.red.size;
        const greenCount = this.teams.green.size;

        if (redCount < greenCount) {
            return 'red';
        } else if (greenCount < redCount) {
            return 'green';
        } else {
            // Equal teams - random assignment
            return Math.random() < 0.5 ? 'red' : 'green';
        }
    }

    /**
     * Get team display name
     */
    _getTeamDisplayName(team) {
        return team === 'red' ? 'אדום (ימין)' : 'ירוק (שמאל)';
    }

    /**
     * Get opposite team display name
     */
    _getOppositeTeamDisplayName(team) {
        return team === 'red' ? 'ירוק (שמאל)' : 'אדום (ימין)';
    }

    /**
     * Sanitize player name
     */
    _sanitizeName(name) {
        return name
            .trim()
            .replace(/[<>]/g, '')  // Remove HTML brackets
            .substring(0, config.MAX_NAME_LENGTH);
    }

    /**
     * Get list of blocked IPs (admin only)
     * @returns {Array} Array of blocked IP addresses
     */
    getBlockedIPs() {
        return Array.from(this.blockedIPs);
    }

    /**
     * Unblock an IP address (admin only)
     * @param {string} ipAddress - IP address to unblock
     * @returns {Object} { success, message }
     */
    unblockIP(ipAddress) {
        if (!ipAddress) {
            return { success: false, message: 'IP address required' };
        }

        if (this.blockedIPs.has(ipAddress)) {
            this.blockedIPs.delete(ipAddress);
            console.log(`IP unblocked by admin: ${ipAddress}`);
            return { success: true, message: `IP ${ipAddress} unblocked successfully` };
        } else {
            return { success: false, message: 'IP address not in blocklist' };
        }
    }

    /**
     * Get blocklist count
     * @returns {number} Number of blocked IPs
     */
    getBlockedIPCount() {
        return this.blockedIPs.size;
    }
}

module.exports = PlayerManager;
