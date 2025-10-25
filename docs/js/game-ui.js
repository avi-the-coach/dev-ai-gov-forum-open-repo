/**
 * Game UI Manager
 * Handles UI transformations for game mode
 * Only activates if gameClient successfully connects
 */

class GameUI {
    constructor() {
        this.gameActive = false;
        this.registrationPopupOpen = false;
        this.playerTeam = null; // Store player's team (red or green)

        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize UI
     */
    init() {
        // Only proceed if gameClient exists and is connected
        if (!window.gameClient) {
            console.log('Game client not available');
            return;
        }

        // Set up event listeners
        this.setupGameClient();
        this.setupEventListeners();

        console.log('Game UI initialized');
    }

    /**
     * Setup game client callbacks
     */
    setupGameClient() {
        const client = window.gameClient;

        client.onGameStateChange = (data) => {
            this.handleGameStateChange(data);
        };

        client.onLeaderboardUpdate = (data) => {
            this.updateLeaderboard(data);
        };

        client.onTimerUpdate = (data) => {
            this.updateTimer(data);
        };

        client.onGameEnd = (data) => {
            this.handleGameEnd(data);
        };

        client.onRegistrationSuccess = (data) => {
            this.handleRegistrationSuccess(data);
        };

        client.onRegistrationError = (message) => {
            this.showRegistrationError(message);
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Game On indicator click
        const indicator = document.getElementById('gameOnIndicator');
        if (indicator) {
            indicator.addEventListener('click', () => this.showRegistrationPopup());
        }

        // Registration form submit
        const regForm = document.getElementById('gameRegistrationForm');
        if (regForm) {
            regForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        // Close popup buttons
        const closeButtons = document.querySelectorAll('.close-game-popup');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hideRegistrationPopup());
        });
    }

    /**
     * Handle game state change
     */
    handleGameStateChange(data) {
        console.log('Game state changed:', data);

        const indicator = document.getElementById('gameOnIndicator');

        if (data.state === 'registration' || data.state === 'practice' || data.state === 'active') {
            // Game is active - show indicator
            if (indicator && !window.gameClient.isActive()) {
                indicator.style.display = 'block';
            }
        } else {
            // Game not active - hide indicator
            if (indicator) {
                indicator.style.display = 'none';
            }
        }

        // Update timer display
        if (data.state === 'active' && data.timeRemaining !== undefined) {
            this.updateTimer({
                timeRemaining: data.timeRemaining,
                formattedTime: this.formatTime(data.timeRemaining)
            });
        }
    }

    /**
     * Show registration popup
     */
    showRegistrationPopup() {
        const popup = document.getElementById('gameRegistrationPopup');
        if (popup) {
            popup.style.display = 'flex';
            this.registrationPopupOpen = true;

            // Focus on name field
            const nameField = document.getElementById('gamePlayerName');
            if (nameField) {
                nameField.focus();
            }
        }
    }

    /**
     * Hide registration popup
     */
    hideRegistrationPopup() {
        const popup = document.getElementById('gameRegistrationPopup');
        if (popup) {
            popup.style.display = 'none';
            this.registrationPopupOpen = false;
        }
    }

    /**
     * Handle registration form submission
     */
    handleRegistration() {
        const nameField = document.getElementById('gamePlayerName');
        const passwordField = document.getElementById('gamePlayerPassword');

        if (!nameField || !passwordField) {
            console.error('Registration fields not found');
            return;
        }

        const name = nameField.value.trim();
        const password = passwordField.value.trim();

        if (!name || !password) {
            this.showRegistrationError('נא למלא שם וסיסמה');
            return;
        }

        // Clear any previous errors
        this.clearRegistrationError();

        // Register with game client
        window.gameClient.registerPlayer(name, password);
    }

    /**
     * Handle successful registration
     */
    handleRegistrationSuccess(data) {
        console.log('Registration success, transforming UI:', data);

        // Hide registration popup
        this.hideRegistrationPopup();

        // Show welcome message with team colors (no fireworks)
        this.showWelcomeMessage(data.message, data.team);

        // Transform UI to game mode
        this.transformToGameMode(data.team);

        // Hide "Game On" indicator
        const indicator = document.getElementById('gameOnIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    /**
     * Show registration error
     */
    showRegistrationError(message) {
        const errorEl = document.getElementById('gameRegistrationError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    /**
     * Clear registration error
     */
    clearRegistrationError() {
        const errorEl = document.getElementById('gameRegistrationError');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    /**
     * Show welcome message (toast notification)
     */
    showWelcomeMessage(message, team = null) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'game-welcome-toast';

        // Add team-specific styling
        if (team === 'red') {
            toast.classList.add('team-red');
        } else if (team === 'green') {
            toast.classList.add('team-green');
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Toast auto-hide logic with hover pause
        const displayDuration = 5000; // 5 seconds
        const fadeOutDuration = 300;
        let startTime = Date.now();
        let hideTimeout = null;
        let removeTimeout = null;
        let isPaused = false;
        let remainingTime = displayDuration;

        const scheduleHide = () => {
            hideTimeout = setTimeout(() => {
                toast.classList.remove('show');
                removeTimeout = setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, fadeOutDuration);
            }, remainingTime);
        };

        // Pause on hover
        toast.addEventListener('mouseenter', () => {
            if (!isPaused) {
                isPaused = true;
                const elapsed = Date.now() - startTime;
                remainingTime = Math.max(0, displayDuration - elapsed);

                // Clear existing timeouts
                if (hideTimeout) clearTimeout(hideTimeout);
                if (removeTimeout) clearTimeout(removeTimeout);
            }
        });

        // Resume on hover out
        toast.addEventListener('mouseleave', () => {
            if (isPaused) {
                isPaused = false;
                startTime = Date.now();

                if (remainingTime > 0) {
                    // Time remaining - continue countdown
                    scheduleHide();
                } else {
                    // Time already expired - close immediately
                    toast.classList.remove('show');
                    setTimeout(() => {
                        if (document.body.contains(toast)) {
                            document.body.removeChild(toast);
                        }
                    }, fadeOutDuration);
                }
            }
        });

        // Start initial countdown
        scheduleHide();
    }

    /**
     * Trigger team-colored fireworks
     */
    triggerTeamFireworks(team) {
        if (!window.fireworks) return;

        const color = team === 'red' ? '#ff4757' : '#2ed573';
        const duration = 3000; // 3 seconds of fireworks

        // Burst multiple fireworks with team color
        let count = 0;
        const maxBursts = 8;
        const interval = setInterval(() => {
            if (count >= maxBursts) {
                clearInterval(interval);
                return;
            }

            // Random position for each burst
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.5); // Top half of screen

            window.fireworks.createFirework(x, y, color);
            count++;
        }, 300); // Burst every 300ms
    }

    /**
     * Trigger celebration fireworks with varied colors for game winner
     */
    triggerCelebrationFireworks(team) {
        if (!window.celebrationFireworks) return;

        // Define color palettes for each team
        const redColors = [
            '#ff4757', // Bright red
            '#ff6348', // Coral red
            '#ff3838', // Pure red
            '#e74c3c', // Alizarin
            '#c0392b', // Pomegranate
            '#ff5252', // Red accent
            '#ff1744'  // Pink red
        ];

        const greenColors = [
            '#2ed573', // Bright green
            '#26de81', // Medium green
            '#1dd1a1', // Turquoise green
            '#20bf6b', // Emerald
            '#27ae60', // Nephritis
            '#00d2d3', // Robin's egg blue
            '#10ac84'  // Persian green
        ];

        const colors = team === 'red' ? redColors : greenColors;

        // More fireworks for celebration - 20 bursts over 6 seconds
        let count = 0;
        const maxBursts = 20;
        const interval = setInterval(() => {
            if (count >= maxBursts) {
                clearInterval(interval);
                return;
            }

            // Multiple fireworks per burst for more spectacle
            const burstsPerInterval = 2;
            for (let i = 0; i < burstsPerInterval; i++) {
                // Random position across entire screen
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * (window.innerHeight * 0.6); // Top 60% of screen

                // Pick random color from palette
                const color = colors[Math.floor(Math.random() * colors.length)];

                window.celebrationFireworks.createFirework(x, y, color);
            }

            count++;
        }, 300); // Burst every 300ms
    }

    /**
     * Transform UI to game mode
     */
    transformToGameMode(team) {
        console.log(`Transforming UI to game mode (${team} team)`);

        this.gameActive = true;
        this.playerTeam = team; // Store player's team for timer coloring

        // Add view controls
        this.addViewControls();

        // Show game leaderboards initially (also hides local score counter)
        this.showGameView();

        // Highlight player's team
        this.highlightPlayerTeam(team);
    }

    /**
     * Add view control buttons (toggle + logout)
     * Positioned bottom-left, round icons with tooltips
     */
    addViewControls() {
        // Check if controls already exist
        if (document.getElementById('gameViewControls')) {
            return;
        }

        // Create controls container
        const controls = document.createElement('div');
        controls.id = 'gameViewControls';
        controls.className = 'game-view-controls';

        // Toggle view button (always shown when logged in)
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggleViewBtn';
        toggleBtn.className = 'game-round-btn toggle-view-btn';
        toggleBtn.innerHTML = '📋';
        toggleBtn.title = 'עבור לטופס הרשמה';
        toggleBtn.onclick = () => this.toggleView();

        // Logout button (shown only in team game view)
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'game-round-btn logout-btn';
        logoutBtn.innerHTML = '🚪';
        logoutBtn.title = 'יציאה מהמשחק';
        logoutBtn.style.display = 'flex'; // Shown initially (in team game view)
        logoutBtn.onclick = () => this.handleLogout();

        controls.appendChild(toggleBtn);
        controls.appendChild(logoutBtn);

        // Add to body
        document.body.appendChild(controls);
    }

    /**
     * Toggle between game view and form view
     */
    toggleView() {
        const formContainer = document.querySelector('.form-container');
        const leaderboards = document.getElementById('gameLeaderboards');
        const toggleBtn = document.getElementById('toggleViewBtn');

        if (!formContainer || !leaderboards || !toggleBtn) return;

        // Check current state
        const showingGame = leaderboards.style.display !== 'none';

        if (showingGame) {
            // Switch to form view
            this.showFormView();
        } else {
            // Switch to game view
            this.showGameView();
        }
    }

    /**
     * Show game leaderboards view
     */
    showGameView() {
        const formContainer = document.querySelector('.form-container');
        const leaderboards = document.getElementById('gameLeaderboards');
        const toggleBtn = document.getElementById('toggleViewBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const scoreDisplay = document.getElementById('score-display');

        // Hide form
        if (formContainer) formContainer.style.display = 'none';

        // Show leaderboards (instructor info and description stay visible)
        if (leaderboards) leaderboards.style.display = 'block';

        // Update toggle button icon and tooltip
        if (toggleBtn) {
            toggleBtn.innerHTML = '📋';
            toggleBtn.title = 'עבור לטופס הרשמה';
        }

        // Show logout button (only visible in team game view)
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }

        // Hide local score counter (not needed in team game view)
        if (scoreDisplay) {
            scoreDisplay.style.display = 'none';
        }
    }

    /**
     * Show form view
     */
    showFormView() {
        const formContainer = document.querySelector('.form-container');
        const leaderboards = document.getElementById('gameLeaderboards');
        const toggleBtn = document.getElementById('toggleViewBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const scoreDisplay = document.getElementById('score-display');

        // Show form
        if (formContainer) formContainer.style.display = 'block';

        // Hide leaderboards (instructor info and description stay visible)
        if (leaderboards) leaderboards.style.display = 'none';

        // Update toggle button icon and tooltip
        if (toggleBtn) {
            toggleBtn.innerHTML = '🎮';
            toggleBtn.title = 'עבור ללוח תוצאות';
        }

        // Hide logout button (not visible in form view)
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }

        // Show local score counter (relevant in form view)
        if (scoreDisplay) {
            scoreDisplay.style.display = 'block';
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        if (!confirm('האם אתה בטוח שברצונך לצאת מהמשחק? (הנתונים שלך יישמרו בשרת)')) {
            return;
        }

        console.log('Logging out from game...');

        // Clear UI
        this.resetUI();

        // Clear client session (but NOT server data)
        if (window.gameClient) {
            window.gameClient.logoutLocal();
        }

        // Show welcome message
        this.showWelcomeMessage('יצאת מהמשחק. ניתן להתחבר שוב בכל עת עם אותו שם וסיסמה.');
    }

    /**
     * Reset UI to initial state
     */
    resetUI() {
        this.gameActive = false;
        this.playerTeam = null; // Clear player's team

        // Show form
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.display = 'block';
        }

        // Hide leaderboards
        const leaderboards = document.getElementById('gameLeaderboards');
        if (leaderboards) {
            leaderboards.style.display = 'none';
        }

        // Remove view controls
        const controls = document.getElementById('gameViewControls');
        if (controls) {
            controls.remove();
        }

        // Show Game On indicator if game is still active
        if (window.gameClient && window.gameClient.isConnected()) {
            const indicator = document.getElementById('gameOnIndicator');
            if (indicator) {
                indicator.style.display = 'block';
            }
        }

        // Clear team highlighting
        const teamColumns = document.querySelectorAll('.team-column');
        teamColumns.forEach(col => col.classList.remove('player-team'));
    }

    /**
     * Highlight player's team
     */
    highlightPlayerTeam(team) {
        const teamColumn = document.getElementById(team === 'red' ? 'redTeamColumn' : 'greenTeamColumn');
        if (teamColumn) {
            teamColumn.classList.add('player-team');
        }
    }

    /**
     * Update leaderboard
     */
    updateLeaderboard(data) {
        console.log('Updating leaderboard:', data);

        // Update red team
        this.updateTeamLeaderboard('red', data.red_team);

        // Update green team
        this.updateTeamLeaderboard('green', data.green_team);
    }

    /**
     * Update team leaderboard
     */
    updateTeamLeaderboard(team, teamData) {
        // Update total score
        const totalEl = document.getElementById(`${team}TeamTotal`);
        if (totalEl) {
            totalEl.textContent = teamData.total.toLocaleString();
        }

        // Update player list
        const listEl = document.getElementById(`${team}TeamList`);
        if (listEl) {
            listEl.innerHTML = '';

            teamData.players.forEach((player, index) => {
                const li = document.createElement('li');
                li.className = 'leaderboard-player';

                // Highlight top 3
                if (index === 0) li.classList.add('rank-1');
                else if (index === 1) li.classList.add('rank-2');
                else if (index === 2) li.classList.add('rank-3');

                li.innerHTML = `
                    <span class="player-rank">${index + 1}.</span>
                    <span class="player-name">${player.name}</span>
                    <span class="player-score">${player.score.toLocaleString()}</span>
                `;

                listEl.appendChild(li);
            });
        }
    }

    /**
     * Update timer
     */
    updateTimer(data) {
        const timerEl = document.getElementById('gameTimer');
        if (timerEl) {
            timerEl.textContent = data.formattedTime;

            // Change color based on player's team
            timerEl.className = 'game-timer-compact';

            if (data.inWarmup) {
                // During warm-up: show orange/yellow
                timerEl.classList.add('timer-warmup');
            } else if (this.playerTeam === 'red') {
                // Red team player: show red timer
                timerEl.classList.add('timer-red-team');
            } else if (this.playerTeam === 'green') {
                // Green team player: show green timer
                timerEl.classList.add('timer-green-team');
            } else {
                // Fallback: time-based colors (shouldn't happen for logged-in players)
                if (data.timeRemaining > 30) {
                    timerEl.classList.add('timer-safe');
                } else if (data.timeRemaining > 15) {
                    timerEl.classList.add('timer-warning');
                } else {
                    timerEl.classList.add('timer-danger');
                }
            }
        }
    }

    /**
     * Handle game end
     */
    handleGameEnd(data) {
        console.log('Game ended:', data);

        // Show winner announcement
        let message = '';
        let winnerTeam = null;

        if (data.winner === 'tie') {
            message = '🤝 תיקו! שני הצוותים הגיעו לתוצאה זהה!';
            winnerTeam = null; // No team color for tie
        } else if (data.winner === 'red') {
            message = '🏆 הצוות האדום ניצח!';
            winnerTeam = 'red';
        } else {
            message = '🏆 הצוות הירוק ניצח!';
            winnerTeam = 'green';
        }

        // Show message with team color (if winner)
        this.showWelcomeMessage(message, winnerTeam);

        // Update final leaderboard
        this.updateLeaderboard(data.leaderboard);
    }

    /**
     * Format time as MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Check if game mode is active
     */
    isGameActive() {
        return this.gameActive;
    }
}

// Initialize game UI globally
window.gameUI = new GameUI();
