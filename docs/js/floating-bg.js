/**
 * Floating Background Animation
 * Creates animated floating AI logos in the background
 */

const floatingBg = document.getElementById('floatingBg');
const logos = [];
const numLogos = 8; // Number of floating logos

// Create floating logos
for (let i = 0; i < numLogos; i++) {
    const logo = document.createElement('div');
    logo.className = 'floating-logo';

    // Random starting position
    logo.style.left = Math.random() * window.innerWidth + 'px';
    logo.style.top = Math.random() * window.innerHeight + 'px';

    floatingBg.appendChild(logo);

    logos.push({
        element: logo,
        x: parseFloat(logo.style.left),
        y: parseFloat(logo.style.top),
        speedX: (Math.random() - 0.5) * 2, // Random speed between -1 and 1
        speedY: (Math.random() - 0.5) * 2,
        speedChangeTimer: 0
    });
}

// Animation function
function animateLogos() {
    logos.forEach(logo => {
        // Change speed randomly every 2-5 seconds
        logo.speedChangeTimer++;
        if (logo.speedChangeTimer > Math.random() * 180 + 120) { // 2-5 seconds at 60fps
            logo.speedX = (Math.random() - 0.5) * 3;
            logo.speedY = (Math.random() - 0.5) * 3;
            logo.speedChangeTimer = 0;
        }

        // Update position
        logo.x += logo.speedX;
        logo.y += logo.speedY;

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

    requestAnimationFrame(animateLogos);
}

// Start animation
animateLogos();

// Handle window resize
window.addEventListener('resize', () => {
    logos.forEach(logo => {
        if (logo.x > window.innerWidth) logo.x = window.innerWidth - 150;
        if (logo.y > window.innerHeight) logo.y = window.innerHeight - 150;
    });
});
