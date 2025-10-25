/**
 * Alien Spaceship Animation
 * Flying aliens that traverse the screen in slalom pattern
 */

class AlienSpaceship {
    constructor() {
        this.aliens = [];
        this.container = null;
        this.audioContext = null;
        this.score = 0;
        this.lastSpawnTime = Date.now();
        this.spawnInterval = 15000; // Spawn every 15 seconds
        this.spawnIntervalVariation = 5000; // +/- 5 seconds random
        
        this.init();
    }

    init() {
        this.createContainer();
        this.startSpawning();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'alien-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;
        document.body.appendChild(this.container);
    }

    playAlienExplosionSound() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const now = this.audioContext.currentTime;
        
        // Sci-fi explosion - swoosh down with distortion
        const oscillator1 = this.audioContext.createOscillator();
        const gainNode1 = this.audioContext.createGain();
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(this.audioContext.destination);
        
        oscillator1.type = 'sawtooth';
        oscillator1.frequency.setValueAtTime(2000, now);
        oscillator1.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        
        gainNode1.gain.setValueAtTime(0.25, now);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        oscillator1.start(now);
        oscillator1.stop(now + 0.5);
        
        // Add metallic "clang"
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);
        
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(800, now);
        oscillator2.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        
        gainNode2.gain.setValueAtTime(0.12, now);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator2.start(now);
        oscillator2.stop(now + 0.3);
    }

    showAlienPoints(x, y) {
        const points = document.createElement('div');
        points.textContent = '+1000';
        points.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            color: #00ff00;
            font-size: 2.8rem;
            font-weight: bold;
            text-shadow: 
                0 0 15px #00ff00,
                0 0 30px #00ff00,
                0 0 45px #00ff00,
                2px 2px 4px rgba(0,0,0,0.5);
            z-index: 9999;
            pointer-events: none;
            animation: alienFloatUp 1.2s ease-out forwards;
            font-family: 'Courier New', monospace;
        `;
        document.body.appendChild(points);

        // Create CSS animation if not exists
        if (!document.getElementById('alienFloatUpAnimation')) {
            const style = document.createElement('style');
            style.id = 'alienFloatUpAnimation';
            style.textContent = `
                @keyframes alienFloatUp {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1) rotate(0deg);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -200px) scale(1.8) rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove after animation
        setTimeout(() => {
            points.remove();
        }, 1200);
        
        // Update score display if exists
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay && window.floatingBg) {
            window.floatingBg.score += 1000;
            scoreDisplay.textContent = `נקודות: ${window.floatingBg.score}`;
            scoreDisplay.style.transform = 'scale(1.3)';
            setTimeout(() => {
                scoreDisplay.style.transform = 'scale(1)';
            }, 200);
        }
    }

    createAlien(fromLeft) {
        const alien = document.createElement('div');
        alien.className = 'alien-spaceship';
        
        const img = document.createElement('img');
        img.src = fromLeft ? 'assets/alian-go-right.png' : 'assets/alian-go-left.png';
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
        `;
        
        alien.appendChild(img);
        
        const startX = fromLeft ? -200 : window.innerWidth + 200;
        const startY = Math.random() * (window.innerHeight - 300) + 150;
        
        alien.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: ${startY}px;
            width: 180px;
            height: 120px;
            pointer-events: auto;
            cursor: pointer;
            z-index: 0;
            transition: none;
        `;
        
        this.container.appendChild(alien);
        
        const alienData = {
            element: alien,
            x: startX,
            y: startY,
            baseY: startY,
            direction: fromLeft ? 1 : -1,
            speed: 3 + Math.random() * 2, // Faster: 3-5 px/frame
            slalomAmplitude: 150 + Math.random() * 100,
            slalomFrequency: 0.002 + Math.random() * 0.001,
            phase: 0,
            destroyed: false,
            // Erratic motion variables
            changeTimer: 0,
            changeInterval: 30 + Math.random() * 40, // Change direction every 30-70 frames
            verticalOffset: 0,
            verticalSpeed: 0,
            targetVerticalSpeed: (Math.random() - 0.5) * 3
        };
        
        // Double-click handler
        alien.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!alienData.destroyed) {
                this.explodeAlien(alienData);
            }
        });
        
        this.aliens.push(alienData);
        this.animateAlien(alienData);
    }

    explodeAlien(alienData) {
        alienData.destroyed = true;
        const alien = alienData.element;
        const rect = alien.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Play explosion sound
        this.playAlienExplosionSound();
        
        // Explosion animation
        alien.style.transition = 'all 0.4s ease-out';
        alien.style.transform = 'scale(2.5) rotate(180deg)';
        alien.style.opacity = '0';
        alien.style.filter = 'brightness(3) hue-rotate(90deg)';
        
        // Show points
        this.showAlienPoints(centerX, centerY);

        // Submit to game server (only if game mode active)
        if (window.gameClient && window.gameClient.isActive()) {
            window.gameClient.submitScore(1000);
        }

        // Remove after animation
        setTimeout(() => {
            alien.remove();
            const index = this.aliens.indexOf(alienData);
            if (index > -1) {
                this.aliens.splice(index, 1);
            }
        }, 400);
    }

    animateAlien(alienData) {
        if (alienData.destroyed) return;
        
        const animate = () => {
            if (alienData.destroyed) return;
            
            // Move horizontally with varying speed
            alienData.x += alienData.speed * alienData.direction;
            
            // Slalom motion (sine wave)
            alienData.phase += alienData.slalomFrequency;
            const slalomOffset = Math.sin(alienData.phase) * alienData.slalomAmplitude;
            
            // Erratic vertical motion
            alienData.changeTimer++;
            if (alienData.changeTimer >= alienData.changeInterval) {
                // Randomly change direction
                alienData.targetVerticalSpeed = (Math.random() - 0.5) * 4;
                alienData.changeInterval = 30 + Math.random() * 40;
                alienData.changeTimer = 0;
                
                // Occasionally change slalom frequency for chaos
                if (Math.random() < 0.3) {
                    alienData.slalomFrequency = 0.002 + Math.random() * 0.002;
                }
            }
            
            // Smooth transition to target vertical speed
            alienData.verticalSpeed += (alienData.targetVerticalSpeed - alienData.verticalSpeed) * 0.1;
            alienData.verticalOffset += alienData.verticalSpeed;
            
            // Combine slalom and erratic motion
            alienData.y = alienData.baseY + slalomOffset + alienData.verticalOffset;
            
            // Keep within screen bounds (bounce off edges)
            if (alienData.y < 50) {
                alienData.y = 50;
                alienData.verticalOffset = 50 - alienData.baseY - slalomOffset;
                alienData.targetVerticalSpeed = Math.abs(alienData.targetVerticalSpeed);
            } else if (alienData.y > window.innerHeight - 150) {
                alienData.y = window.innerHeight - 150;
                alienData.verticalOffset = (window.innerHeight - 150) - alienData.baseY - slalomOffset;
                alienData.targetVerticalSpeed = -Math.abs(alienData.targetVerticalSpeed);
            }
            
            // Update position
            alienData.element.style.left = alienData.x + 'px';
            alienData.element.style.top = alienData.y + 'px';
            
            // Check if out of bounds
            const outOfBounds = alienData.direction > 0 
                ? alienData.x > window.innerWidth + 200 
                : alienData.x < -200;
            
            if (outOfBounds) {
                alienData.element.remove();
                const index = this.aliens.indexOf(alienData);
                if (index > -1) {
                    this.aliens.splice(index, 1);
                }
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    startSpawning() {
        const spawn = () => {
            const now = Date.now();
            const timeSinceLastSpawn = now - this.lastSpawnTime;
            const nextSpawnTime = this.spawnInterval + (Math.random() * this.spawnIntervalVariation * 2 - this.spawnIntervalVariation);
            
            if (timeSinceLastSpawn >= nextSpawnTime) {
                const fromLeft = Math.random() < 0.5;
                this.createAlien(fromLeft);
                this.lastSpawnTime = now;
            }
            
            setTimeout(spawn, 1000); // Check every second
        };
        
        // First spawn after 5-10 seconds
        setTimeout(() => {
            const fromLeft = Math.random() < 0.5;
            this.createAlien(fromLeft);
            this.lastSpawnTime = Date.now();
            spawn();
        }, 5000 + Math.random() * 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.alienSpaceship = new AlienSpaceship();
});
