/**
 * Particles Background Effect
 * Creates animated floating particles in the background
 */

(function() {
    const particlesContainer = document.getElementById('particles');
    
    if (!particlesContainer) return;

    // Add CSS for particles
    const style = document.createElement('style');
    style.textContent = `
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
        }

        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(99, 102, 241, 0.3);
            border-radius: 50%;
            animation: float linear infinite;
        }

        @keyframes float {
            0% {
                transform: translateY(100vh) translateX(0) scale(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(100px) scale(1);
                opacity: 0;
            }
        }

        .particle:nth-child(even) {
            background: rgba(16, 185, 129, 0.3);
        }

        .particle:nth-child(3n) {
            background: rgba(245, 158, 11, 0.2);
        }
    `;
    document.head.appendChild(style);

    // Create particles
    function createParticles() {
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position
            particle.style.left = Math.random() * 100 + '%';
            
            // Random size
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random animation duration
            const duration = Math.random() * 20 + 15;
            particle.style.animationDuration = duration + 's';
            
            // Random delay
            const delay = Math.random() * 20;
            particle.style.animationDelay = delay + 's';
            
            particlesContainer.appendChild(particle);
        }
    }

    createParticles();
})();
