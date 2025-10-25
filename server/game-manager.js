/**
 * Game Manager
 * Handles game state, timer, and lifecycle
 */

const config = require('./config');

class GameManager {
    constructor() {
        this.state = 'idle';  // idle, registration, practice, active, ended
        this.duration = config.DEFAULT_GAME_DURATION;
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.startTime = null;
        this.endTime = null;
        this.onTimerTick = null;  // Callback for timer updates
        this.onGameEnd = null;    // Callback when game ends
    }

    /**
     * Create a new game session
     * Opens registration but doesn't start timer
     */
    createGame(duration = null) {
        if (this.state !== 'idle' && this.state !== 'ended') {
            return { success: false, message: 'Game already active' };
        }

        this.state = 'registration';
        this.duration = duration || config.DEFAULT_GAME_DURATION;
        this.timeRemaining = this.duration;

        console.log(`Game created: ${this.duration}s duration, registration open`);

        return {
            success: true,
            state: this.state,
            duration: this.duration,
            message: 'Game created, registration open'
        };
    }

    /**
     * Start the game (begins timer, enables scoring)
     * Includes 5-second warm-up period
     */
    startGame() {
        if (this.state !== 'registration' && this.state !== 'practice') {
            return { success: false, message: 'Game not ready to start' };
        }

        this.state = 'active';
        this.timeRemaining = this.duration + 5; // Add 5 second warm-up
        this.startTime = Date.now();

        // Start timer countdown
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            // Call timer tick callback
            if (this.onTimerTick) {
                this.onTimerTick(this.timeRemaining);
            }

            // Check if time's up
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);

        console.log(`Game started: ${this.duration}s timer active with 5-second warm-up`);

        return {
            success: true,
            state: this.state,
            timeRemaining: this.timeRemaining,
            warmupTime: 5,
            message: 'Game started with warm-up'
        };
    }

    /**
     * Stop/end the game
     */
    stopGame() {
        if (this.state !== 'active') {
            return { success: false, message: 'No active game to stop' };
        }

        this.endGame();

        return {
            success: true,
            state: this.state,
            message: 'Game stopped by admin'
        };
    }

    /**
     * End the game (internal)
     */
    endGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.state = 'ended';
        this.endTime = Date.now();
        this.timeRemaining = 0;

        console.log('Game ended');

        // Call game end callback
        if (this.onGameEnd) {
            this.onGameEnd();
        }
    }

    /**
     * Reset game (prepare for new game)
     */
    resetGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.state = 'idle';
        this.timeRemaining = 0;
        this.startTime = null;
        this.endTime = null;

        console.log('Game reset');

        return {
            success: true,
            state: this.state,
            message: 'Game reset'
        };
    }

    /**
     * Reset scores and restart timer (keep players)
     * This restarts the game immediately with 5-second warm-up period
     */
    resetScoresAndTime() {
        if (this.state !== 'active' && this.state !== 'ended') {
            return { success: false, message: 'Game must be active or ended to reset scores and time' };
        }

        // Clear existing timer if any
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Restart game with same duration + 5 second warm-up
        this.state = 'active';
        this.timeRemaining = this.duration + 5; // Add 5 second warm-up
        this.startTime = Date.now();
        this.endTime = null;

        // Start timer countdown
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            // Call timer tick callback
            if (this.onTimerTick) {
                this.onTimerTick(this.timeRemaining);
            }

            // Check if time's up (only after warm-up period)
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);

        console.log('Scores reset and timer restarted with 5-second warm-up');

        return {
            success: true,
            state: this.state,
            timeRemaining: this.timeRemaining,
            warmupTime: 5,
            message: 'Scores reset and timer restarted with warm-up'
        };
    }

    /**
     * Delete game completely (return to idle, no game active)
     */
    deleteGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.state = 'idle';
        this.timeRemaining = 0;
        this.startTime = null;
        this.endTime = null;

        console.log('Game deleted completely');

        return {
            success: true,
            state: this.state,
            message: 'Game deleted'
        };
    }

    /**
     * Set game duration
     * @param {boolean} allowDuringActive - Allow setting duration even when game is active (for reset purposes)
     */
    setDuration(seconds, allowDuringActive = false) {
        if (this.state === 'active' && !allowDuringActive) {
            return { success: false, message: 'Cannot change duration while game is active' };
        }

        this.duration = seconds;

        // Only update timeRemaining if game is not active
        if (this.state !== 'active') {
            this.timeRemaining = seconds;
        }

        console.log(`Game duration set to ${seconds}s`);

        return {
            success: true,
            duration: this.duration,
            message: `Duration set to ${seconds} seconds`
        };
    }

    /**
     * Get current game state
     */
    getState() {
        return this.state;
    }

    /**
     * Get full game state
     */
    getFullState() {
        return {
            state: this.state,
            duration: this.duration,
            timeRemaining: this.timeRemaining,
            startTime: this.startTime,
            endTime: this.endTime
        };
    }

    /**
     * Check if scoring is enabled
     * Scoring is only enabled when game is active AND not in warm-up period
     */
    isScoringEnabled() {
        if (this.state !== 'active') {
            return false;
        }

        // Check if in warm-up period (timeRemaining > duration means we're in warm-up)
        const inWarmup = this.timeRemaining > this.duration;
        return !inWarmup;
    }

    /**
     * Check if currently in warm-up period
     */
    isInWarmup() {
        return this.state === 'active' && this.timeRemaining > this.duration;
    }

    /**
     * Get warm-up time remaining
     */
    getWarmupTimeRemaining() {
        if (!this.isInWarmup()) {
            return 0;
        }
        return this.timeRemaining - this.duration;
    }

    /**
     * Check if registration is open
     */
    isRegistrationOpen() {
        return ['registration', 'practice', 'active'].includes(this.state);
    }

    /**
     * Format time remaining as MM:SS
     * Shows negative time during warm-up period (e.g., -00:10)
     */
    getFormattedTime() {
        if (this.isInWarmup()) {
            // Show warm-up countdown as negative
            const warmupSeconds = this.getWarmupTimeRemaining();
            const minutes = Math.floor(warmupSeconds / 60);
            const seconds = warmupSeconds % 60;
            return `-${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Normal game time
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Set timer tick callback
     */
    setTimerTickCallback(callback) {
        this.onTimerTick = callback;
    }

    /**
     * Set game end callback
     */
    setGameEndCallback(callback) {
        this.onGameEnd = callback;
    }
}

module.exports = GameManager;
