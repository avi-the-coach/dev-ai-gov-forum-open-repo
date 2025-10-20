/**
 * Fireworks Animation
 * Creates fireworks effect on header hover with sound
 */

const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
const header = document.getElementById('header');
let fireworks = [];
let particles = [];
let clickFireworks = []; // Separate array for click fireworks
let isFireworksActive = false;

// Set canvas size
function resizeCanvas() {
    canvas.width = header.offsetWidth;
    canvas.height = header.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Firework class
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = y;
        this.speed = 3;
        this.colors = ['#9333ea', '#a855f7', '#c084fc', '#e879f9', '#fbbf24', '#f59e0b'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    update() {
        if (this.y > this.targetY) {
            this.y -= this.speed;
            return false; // Not exploded yet
        }
        return true; // Explode!
    }

    draw() {
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    explode() {
        // Create particles
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
    }
}

// Straight-line click firework class
class ClickFirework {
    constructor(startX, startY, clickX, clickY, endX, endY) {
        this.x = startX;
        this.y = startY;
        this.clickX = clickX;
        this.clickY = clickY;
        this.endX = endX;
        this.endY = endY;

        // Calculate direction vector
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        this.speed = 8; // Fast straight line
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;

        this.colors = ['#9333ea', '#a855f7', '#c084fc', '#e879f9', '#fbbf24', '#f59e0b'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.trail = []; // Store trail positions
        this.maxTrailLength = 15;
        this.hasExploded = false;
        this.passedClickPoint = false;
    }

    update() {
        // Check if passed click point
        if (!this.passedClickPoint) {
            const distToClick = Math.sqrt(
                Math.pow(this.x - this.clickX, 2) +
                Math.pow(this.y - this.clickY, 2)
            );
            if (distToClick < 10) {
                this.passedClickPoint = true;
                this.explode();
            }
        }

        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Check if out of bounds
        if (this.x < -50 || this.x > canvas.width + 50 ||
            this.y < -50 || this.y > canvas.height + 50) {
            return true; // Remove
        }

        return false;
    }

    draw() {
        ctx.save();

        // Draw trail
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length;
            ctx.globalAlpha = alpha * 0.7;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Draw main firework
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Bright center
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
    }

    explode() {
        if (this.hasExploded) return;
        this.hasExploded = true;

        // Create particles at click point
        const particleCount = 60;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.clickX, this.clickY, this.color));
        }
    }
}

// Particle class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // Gravity
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Add intense glow to particles
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Add bright center
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
    }
}

// Animation loop
function animateFireworks() {
    if (!isFireworksActive && fireworks.length === 0 && particles.length === 0 && clickFireworks.length === 0) {
        return; // Stop animation when not active
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw hover fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].draw();
        if (fireworks[i].update()) {
            fireworks[i].explode();
            fireworks.splice(i, 1);
        }
    }

    // Update and draw click fireworks (straight lines)
    for (let i = clickFireworks.length - 1; i >= 0; i--) {
        clickFireworks[i].draw();
        if (clickFireworks[i].update()) {
            clickFireworks.splice(i, 1);
        }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animateFireworks);
}

// Launch firework
function launchFirework() {
    if (isFireworksActive) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5; // Upper half
        fireworks.push(new Firework(x, y));

        // Launch multiple fireworks
        setTimeout(() => {
            if (isFireworksActive) {
                const x2 = Math.random() * canvas.width;
                const y2 = Math.random() * canvas.height * 0.5;
                fireworks.push(new Firework(x2, y2));
            }
        }, 100);

        setTimeout(() => {
            if (isFireworksActive) {
                const x3 = Math.random() * canvas.width;
                const y3 = Math.random() * canvas.height * 0.5;
                fireworks.push(new Firework(x3, y3));
            }
        }, 250);
    }
}

// Sound effect using Web Audio API
let audioContext;
function playFireworkSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Header hover events (WITHOUT sound)
let fireworkInterval;
header.addEventListener('mouseenter', function() {
    isFireworksActive = true;
    animateFireworks();
    launchFirework();
    // Removed sound from hover

    // Launch fireworks periodically (WITHOUT sound)
    fireworkInterval = setInterval(() => {
        launchFirework();
        // No sound on hover
    }, 500);
});

header.addEventListener('mouseleave', function() {
    isFireworksActive = false;
    clearInterval(fireworkInterval);

    // Clear all pending click timeouts
    clickTimeouts.forEach(timeout => clearTimeout(timeout));
    clickTimeouts = [];

    // Immediately clear all fireworks and particles
    fireworks = [];
    clickFireworks = [];
    particles = [];

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Header click event - Launch fireworks at exact click position WITH sound
let lastClickTime = 0;
const clickCooldown = 1000; // 1 second cooldown between clicks
let clickTimeouts = []; // Track all click-related timeouts

header.addEventListener('click', function(event) {
    const now = Date.now();

    // Check if cooldown period has passed
    if (now - lastClickTime < clickCooldown) {
        return; // Ignore click - still in cooldown
    }

    lastClickTime = now;

    // Get click position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Make sure animation is running
    if (clickFireworks.length === 0 && fireworks.length === 0 && particles.length === 0) {
        animateFireworks();
    }

    // Find the farthest corner/edge point from click
    const corners = [
        { x: 0, y: 0 },                     // Top-left
        { x: canvas.width, y: 0 },          // Top-right
        { x: 0, y: canvas.height },         // Bottom-left
        { x: canvas.width, y: canvas.height }, // Bottom-right
        { x: clickX, y: 0 },                // Top-center
        { x: clickX, y: canvas.height },    // Bottom-center
        { x: 0, y: clickY },                // Left-center
        { x: canvas.width, y: clickY }      // Right-center
    ];

    let farthestPoint = corners[0];
    let maxDistance = 0;

    corners.forEach(point => {
        const dist = Math.sqrt(
            Math.pow(point.x - clickX, 2) +
            Math.pow(point.y - clickY, 2)
        );
        if (dist > maxDistance) {
            maxDistance = dist;
            farthestPoint = point;
        }
    });

    // Calculate end point (continue through click point to opposite edge)
    const dx = clickX - farthestPoint.x;
    const dy = clickY - farthestPoint.y;
    const totalDistance = Math.sqrt(dx * dx + dy * dy);

    // Extend line to canvas edge
    const extendFactor = (canvas.width + canvas.height) / totalDistance;
    const endX = farthestPoint.x + dx * extendFactor;
    const endY = farthestPoint.y + dy * extendFactor;

    // Launch the straight-line firework
    const clickFw = new ClickFirework(
        farthestPoint.x,
        farthestPoint.y,
        clickX,
        clickY,
        endX,
        endY
    );
    clickFireworks.push(clickFw);

    // Play sound on click
    playFireworkSound();
    const sound1 = setTimeout(() => playFireworkSound(), 150);
    const sound2 = setTimeout(() => playFireworkSound(), 300);
    clickTimeouts.push(sound1, sound2);
});
