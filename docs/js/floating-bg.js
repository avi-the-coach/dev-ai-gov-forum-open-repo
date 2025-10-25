/**
 * Floating Background Animation with Settings Control
 * Creates animated floating AI logos with configurable settings
 */

class FloatingBackground {
    constructor() {
        this.container = document.getElementById('floatingBg');
        this.logos = [];
        this.score = 0;
        this.scoreDisplay = null;
        
        // Default settings
        this.settings = {
            logoCount: 8,
            logoSpeedMultiplier: 1, // 1 = current speed
            messageCount: 1,
            messageSpeedMultiplier: 1 // 1 = slow (current), 2 = high
        };
        
        // Speed presets for logos (5 fixed speeds)
        this.logoSpeedPresets = [0.5, 0.75, 1, 2, 3]; // Slowest to fastest (3x)
        
        this.animationFrame = null;
        this.settingsPanel = null;
        
        this.init();
    }

    init() {
        this.createScoreDisplay();
        this.createLogos();
        this.createSettingsButton();
        this.createSettingsPanel();
        this.setupEventListeners();
        this.startAnimation();
    }

    createScoreDisplay() {
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.id = 'score-display';
        this.scoreDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, #9333ea, #a855f7);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 1.2rem;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
            z-index: 998;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;
        this.scoreDisplay.textContent = `נקודות: ${this.score}`;
        document.body.appendChild(this.scoreDisplay);
    }

    updateScore(points) {
        this.score += points;
        this.scoreDisplay.textContent = `נקודות: ${this.score}`;
        
        // Pulse animation on score update
        this.scoreDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.scoreDisplay.style.transform = 'scale(1)';
        }, 200);
    }

    createLogos() {
        // Clear existing logos
        this.logos.forEach(logo => logo.element.remove());
        this.logos = [];

        // Create new logos based on settings
        for (let i = 0; i < this.settings.logoCount; i++) {
            const logo = document.createElement('div');
            logo.className = 'floating-logo';
            logo.style.left = Math.random() * window.innerWidth + 'px';
            logo.style.top = Math.random() * window.innerHeight + 'px';
            logo.style.cursor = 'pointer';
            logo.style.pointerEvents = 'auto';
            
            this.container.appendChild(logo);

            const logoData = {
                element: logo,
                x: parseFloat(logo.style.left),
                y: parseFloat(logo.style.top),
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                speedChangeTimer: 0
            };

            // Add double-click handler for blowing up logos
            logo.addEventListener('dblclick', (e) => {
                console.log('Logo double-clicked!');
                e.preventDefault();
                e.stopPropagation();
                this.blowUpLogo(logoData);
            });

            this.logos.push(logoData);
        }
    }

    playExplosionSound() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const now = this.audioContext.currentTime;
        
        // Main explosion boom (low frequency sweep)
        const oscillator1 = this.audioContext.createOscillator();
        const gainNode1 = this.audioContext.createGain();
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(this.audioContext.destination);
        
        oscillator1.type = 'sawtooth';
        oscillator1.frequency.setValueAtTime(150, now);
        oscillator1.frequency.exponentialRampToValueAtTime(30, now + 0.8);
        
        gainNode1.gain.setValueAtTime(0.3, now);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        oscillator1.start(now);
        oscillator1.stop(now + 0.8);
        
        // High frequency "crack" for impact
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);
        
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(1200, now);
        oscillator2.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        
        gainNode2.gain.setValueAtTime(0.15, now);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        oscillator2.start(now);
        oscillator2.stop(now + 0.15);
    }

    blowUpLogo(logoData) {
        const logo = logoData.element;
        const rect = logo.getBoundingClientRect();
        
        // Play explosion sound
        this.playExplosionSound();
        
        // Explosion animation
        logo.style.transition = 'all 0.3s ease-out';
        logo.style.transform = 'scale(2)';
        logo.style.opacity = '0';
        
        // Show +500 points
        this.showPointsAnimation(rect.left + rect.width / 2, rect.top + rect.height / 2);

        // Update score (local - always works)
        this.updateScore(500);

        // Submit to game server (only if game mode active)
        if (window.gameClient && window.gameClient.isActive()) {
            window.gameClient.submitScore(500);
        }

        // Remove logo and recreate after delay
        setTimeout(() => {
            const index = this.logos.indexOf(logoData);
            if (index > -1) {
                logo.remove();
                this.logos.splice(index, 1);
                
                // Create new logo to replace it
                setTimeout(() => {
                    const newLogo = document.createElement('div');
                    newLogo.className = 'floating-logo';
                    newLogo.style.left = Math.random() * window.innerWidth + 'px';
                    newLogo.style.top = Math.random() * window.innerHeight + 'px';
                    newLogo.style.cursor = 'pointer';
                    newLogo.style.pointerEvents = 'auto';
                    
                    this.container.appendChild(newLogo);

                    const newLogoData = {
                        element: newLogo,
                        x: parseFloat(newLogo.style.left),
                        y: parseFloat(newLogo.style.top),
                        speedX: (Math.random() - 0.5) * 2,
                        speedY: (Math.random() - 0.5) * 2,
                        speedChangeTimer: 0
                    };

                    newLogo.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        this.blowUpLogo(newLogoData);
                    });

                    this.logos.push(newLogoData);
                }, 500);
            }
        }, 300);
    }

    showPointsAnimation(x, y) {
        const points = document.createElement('div');
        points.textContent = '+500';
        points.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            color: #ffd700;
            font-size: 2.5rem;
            font-weight: bold;
            text-shadow: 
                0 0 10px #ffd700,
                0 0 20px #ffa500,
                2px 2px 4px rgba(0,0,0,0.5);
            z-index: 9998;
            pointer-events: none;
            animation: floatUp 1s ease-out forwards;
        `;
        document.body.appendChild(points);

        // Create CSS animation
        if (!document.getElementById('floatUpAnimation')) {
            const style = document.createElement('style');
            style.id = 'floatUpAnimation';
            style.textContent = `
                @keyframes floatUp {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -150px) scale(1.5);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove after animation
        setTimeout(() => {
            points.remove();
        }, 1000);
    }

    createSettingsButton() {
        const button = document.createElement('button');
        button.id = 'settings-button';
        button.innerHTML = '⚙️';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: white;
            border: 2px solid #9333ea;
            cursor: pointer;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
            z-index: 999;
            transition: all 0.3s ease;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1) rotate(90deg)';
            button.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.5)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1) rotate(0deg)';
            button.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.3)';
        });
        
        button.addEventListener('click', () => {
            console.log('Settings button clicked!');
            console.log('Panel element:', this.settingsPanel);
            this.showSettingsPanel();
        });
        
        document.body.appendChild(button);
    }

    createSettingsPanel() {
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'settings-backdrop';
        backdrop.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        `;
        document.body.appendChild(backdrop);
        this.backdrop = backdrop;

        // Create panel
        const panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 3px solid #9333ea;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 40px rgba(147, 51, 234, 0.8);
            z-index: 10000;
            min-width: 350px;
            direction: rtl;
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #9333ea; font-size: 1.3rem;">הגדרות תצוגה</h3>
                <button id="closeSettings" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #9333ea;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">✕</button>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                    מספר לוגואים: <span id="logoCountValue">8</span>
                </label>
                <input type="range" id="logoCountSlider" min="4" max="20" value="8" step="1" style="width: 100%;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                    מהירות לוגואים: <span id="logoSpeedValue">רגיל</span>
                </label>
                <input type="range" id="logoSpeedSlider" min="0" max="4" value="2" step="1" style="width: 100%;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-top: 5px;">
                    <span>איטי מאוד</span>
                    <span>מהיר מאוד</span>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                    מספר הודעות במקביל: <span id="messageCountValue">1</span>
                </label>
                <input type="range" id="messageCountSlider" min="1" max="4" value="1" step="1" style="width: 100%;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                    מהירות הודעות: <span id="messageSpeedValue">איטי</span>
                </label>
                <input type="range" id="messageSpeedSlider" min="1" max="2" value="1" step="1" style="width: 100%;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-top: 5px;">
                    <span>איטי</span>
                    <span>מהיר (X2)</span>
                </div>
            </div>

            <div style="margin-bottom: 0; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <label style="display: flex; align-items: center; cursor: pointer; font-weight: 600; color: #333;">
                    <input type="checkbox" id="clickToExpandMode" style="margin-left: 10px; width: 18px; height: 18px; cursor: pointer;">
                    <span>דורש קליק לפתיחת תוכן הוובינר (במקום ריחוף)</span>
                </label>
            </div>
        `;

        document.body.appendChild(panel);
        this.settingsPanel = panel;
    }

    setupEventListeners() {
        // Close panel on X button
        document.getElementById('closeSettings').addEventListener('click', () => {
            this.hideSettingsPanel();
        });

        // Close panel on click outside
        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) {
                this.hideSettingsPanel();
            }
        });

        // Close panel on backdrop click
        this.backdrop.addEventListener('click', () => {
            this.hideSettingsPanel();
        });

        // Logo count slider
        document.getElementById('logoCountSlider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('logoCountValue').textContent = value;
            this.settings.logoCount = value;
            this.createLogos();
        });

        // Logo speed slider
        document.getElementById('logoSpeedSlider').addEventListener('input', (e) => {
            const index = parseInt(e.target.value);
            this.settings.logoSpeedMultiplier = this.logoSpeedPresets[index];
            
            const labels = ['איטי מאוד', 'איטי', 'רגיל', 'מהיר', 'מהיר מאוד'];
            document.getElementById('logoSpeedValue').textContent = labels[index];
        });

        // Message count slider
        document.getElementById('messageCountSlider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            console.log(`Message count slider changed to: ${value}`);
            document.getElementById('messageCountValue').textContent = value;
            this.settings.messageCount = value;
            
            // Update inspirational talk max messages if available
            console.log('window.inspirationalTalk exists?', !!window.inspirationalTalk);
            if (window.inspirationalTalk) {
                window.inspirationalTalk.maxActiveMessages = value;
                console.log('Updated maxActiveMessages to:', window.inspirationalTalk.maxActiveMessages);
            } else {
                console.warn('window.inspirationalTalk not available yet!');
            }
        });

        // Message speed slider
        document.getElementById('messageSpeedSlider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.settings.messageSpeedMultiplier = value;
            
            const label = value === 1 ? 'איטי' : 'מהיר (X2)';
            document.getElementById('messageSpeedValue').textContent = label;
            
            // Update inspirational talk speed if available
            if (window.inspirationalTalk) {
                window.inspirationalTalk.messageSpeedMultiplier = value;
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.logos.forEach(logo => {
                if (logo.x > window.innerWidth) logo.x = window.innerWidth - 150;
                if (logo.y > window.innerHeight) logo.y = window.innerHeight - 150;
            });
        });
    }

    showSettingsPanel() {
        console.log('showSettingsPanel called');
        this.backdrop.style.display = 'block';
        this.settingsPanel.style.display = 'block';
        console.log('Panel and backdrop shown');
    }

    hideSettingsPanel() {
        this.backdrop.style.display = 'none';
        this.settingsPanel.style.display = 'none';
    }

    animateLogos() {
        this.logos.forEach(logo => {
            // Change speed randomly every 2-5 seconds
            logo.speedChangeTimer++;
            if (logo.speedChangeTimer > Math.random() * 180 + 120) {
                logo.speedX = (Math.random() - 0.5) * 3;
                logo.speedY = (Math.random() - 0.5) * 3;
                logo.speedChangeTimer = 0;
            }

            // Update position with speed multiplier
            const speedMultiplier = this.settings.logoSpeedMultiplier;
            logo.x += logo.speedX * speedMultiplier;
            logo.y += logo.speedY * speedMultiplier;

            // Bounce off edges
            if (logo.x < -150 || logo.x > window.innerWidth + 150) {
                logo.speedX *= -1;
                logo.x = Math.max(-150, Math.min(window.innerWidth + 150, logo.x));
            }
            if (logo.y < -150 || logo.y > window.innerHeight + 150) {
                logo.speedY *= -1;
                logo.y = Math.max(-150, Math.min(window.innerHeight + 150, logo.y));
            }

            // Apply position
            logo.element.style.left = logo.x + 'px';
            logo.element.style.top = logo.y + 'px';
        });

        this.animationFrame = requestAnimationFrame(() => this.animateLogos());
    }

    startAnimation() {
        this.animateLogos();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.floatingBg = new FloatingBackground();
});
