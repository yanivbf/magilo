/**
 * Stav Holographic Avatar Component
 * Ultimate version with all effects
 * Usage: new StavHologram(containerId, options)
 */

class StavHologram {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found!`);
            return;
        }
        
        this.options = {
            imageUrl: options.imageUrl || '/stav-avatar.png',
            autoDemo: options.autoDemo !== undefined ? options.autoDemo : true,
            size: options.size || 'medium', // 'small', 'medium', 'large'
            ...options
        };
        
        this.state = 'listening';
        this.particles = [];
        
        this.init();
    }
    
    init() {
        this.createStructure();
        this.createParticles();
        this.setupEventListeners();
        this.startAnimation();
        
        if (this.options.autoDemo) {
            setTimeout(() => this.demo(), 2000);
        }
    }
    
    createStructure() {
        const sizes = {
            small: { width: 300, height: 450 },
            medium: { width: 450, height: 650 },
            large: { width: 600, height: 850 }
        };
        
        const size = sizes[this.options.size];
        
        this.container.innerHTML = `
            <div class="stav-hologram-stage" style="position: relative; width: ${size.width}px; height: ${size.height}px;">
                <canvas class="stav-particles-back" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;"></canvas>
                
                <div class="stav-platform" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 90%; height: 60%; z-index: 2;">
                    <div class="stav-ground-glow" style="
                        position: absolute;
                        bottom: -30px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 120%;
                        height: 150px;
                        background: radial-gradient(ellipse, rgba(0,255,255,0.6) 0%, rgba(255,0,255,0.3) 40%, transparent 70%);
                        filter: blur(40px);
                        animation: stav-ground-pulse 3s ease-in-out infinite alternate;
                    "></div>
                    
                    <div class="stav-hex-grid" style="
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        background: 
                            linear-gradient(30deg, transparent 48%, rgba(0,255,255,0.4) 49%, rgba(0,255,255,0.4) 51%, transparent 52%),
                            linear-gradient(-30deg, transparent 48%, rgba(0,255,255,0.4) 49%, rgba(0,255,255,0.4) 51%, transparent 52%);
                        background-size: 30px 50px;
                        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                        animation: stav-grid-pulse 3s ease-in-out infinite;
                        opacity: 0.6;
                    "></div>
                </div>
                
                <div class="stav-avatar-wrapper" style="
                    position: absolute;
                    bottom: 15%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 70%;
                    height: 70%;
                    animation: stav-float 5s ease-in-out infinite;
                    z-index: 3;
                ">
                    <div class="stav-energy-field" style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 120%;
                        height: 120%;
                        border-radius: 50%;
                        background: radial-gradient(ellipse, rgba(0,255,255,0.15) 0%, rgba(255,0,255,0.1) 40%, transparent 70%);
                        filter: blur(35px);
                        animation: stav-energy-pulse 4s ease-in-out infinite;
                    "></div>
                    
                    <div class="stav-avatar-main" style="position: relative; width: 100%; height: 100%;">
                        <div style="
                            position: absolute;
                            top: -15px; left: -15px; right: -15px; bottom: -15px;
                            border-radius: 50%;
                            box-shadow: 
                                inset 0 0 40px rgba(0,255,255,0.5),
                                0 0 40px rgba(0,255,255,0.5);
                            animation: stav-edge-pulse 2s ease-in-out infinite alternate;
                            z-index: 1;
                        "></div>
                        
                        <img src="${this.options.imageUrl}" alt="סתיו" style="
                            position: relative;
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                            filter: 
                                brightness(1.3)
                                contrast(1.1)
                                drop-shadow(0 0 30px rgba(0,255,255,0.8))
                                drop-shadow(0 0 60px rgba(255,0,255,0.6));
                            animation: stav-shimmer 0.2s infinite;
                            z-index: 2;
                        ">
                        
                        <div style="
                            position: absolute;
                            top: 0; left: 0;
                            width: 100%;
                            height: 100%;
                            background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.05) 2px, rgba(0,255,255,0.05) 4px);
                            animation: stav-scan 10s linear infinite;
                            z-index: 3;
                            pointer-events: none;
                        "></div>
                        
                        <div style="
                            position: absolute;
                            top: 0; left: 0;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.1) 25%, rgba(255,0,255,0.1) 50%, rgba(255,215,0,0.1) 75%, transparent 100%);
                            animation: stav-sweep 3s linear infinite;
                            z-index: 4;
                            pointer-events: none;
                        "></div>
                    </div>
                    
                    <div class="stav-orb" style="
                        position: absolute;
                        top: 15%;
                        right: 5%;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: radial-gradient(circle at 35% 35%, rgba(255,215,0,1) 0%, rgba(255,215,0,0.6) 50%, rgba(255,215,0,0.2) 100%);
                        box-shadow: 0 0 30px rgba(255,215,0,0.8), inset 0 0 20px rgba(255,255,255,0.5);
                        animation: stav-orb-float 5s ease-in-out infinite;
                        z-index: 5;
                    "></div>
                </div>
                
                <canvas class="stav-particles-front" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none;"></canvas>
            </div>
            
            <style>
                @keyframes stav-float {
                    0%, 100% { transform: translateX(-50%) translateY(0px); }
                    50% { transform: translateX(-50%) translateY(-20px); }
                }
                @keyframes stav-shimmer {
                    0%, 100% { opacity: 0.98; }
                    50% { opacity: 1; }
                }
                @keyframes stav-energy-pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.6; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                }
                @keyframes stav-grid-pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
                @keyframes stav-ground-pulse {
                    0% { opacity: 0.5; transform: translateX(-50%) scale(0.9); }
                    100% { opacity: 1; transform: translateX(-50%) scale(1.1); }
                }
                @keyframes stav-edge-pulse {
                    0% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
                @keyframes stav-scan {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(25px); }
                }
                @keyframes stav-sweep {
                    0% { transform: translateX(-100%); opacity: 0; }
                    10% { opacity: 0.5; }
                    90% { opacity: 0.5; }
                    100% { transform: translateX(100%); opacity: 0; }
                }
                @keyframes stav-orb-float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-35px) scale(1.15); }
                }
                
                .stav-speaking .stav-avatar-main img {
                    filter: 
                        brightness(1.5) 
                        contrast(1.2)
                        saturate(1.3)
                        drop-shadow(0 0 50px rgba(255,0,255,1))
                        drop-shadow(0 0 100px rgba(255,0,255,0.8)) !important;
                    animation: stav-shimmer 0.1s infinite, stav-speaking-pulse 0.6s ease-in-out infinite !important;
                }
                
                @keyframes stav-speaking-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.04); }
                }
                
                .stav-speaking .stav-energy-field {
                    background: radial-gradient(ellipse, rgba(255,0,255,0.3) 0%, rgba(255,0,255,0.2) 40%, transparent 70%) !important;
                }
                
                .stav-speaking .stav-ground-glow {
                    background: radial-gradient(ellipse, rgba(255,0,255,0.8) 0%, rgba(255,0,255,0.5) 40%, transparent 70%) !important;
                }
                
                .stav-speaking .stav-hex-grid {
                    background: 
                        linear-gradient(30deg, transparent 48%, rgba(255,0,255,0.6) 49%, rgba(255,0,255,0.6) 51%, transparent 52%),
                        linear-gradient(-30deg, transparent 48%, rgba(255,0,255,0.6) 49%, rgba(255,0,255,0.6) 51%, transparent 52%) !important;
                }
            </style>
        `;
        
        this.stage = this.container.querySelector('.stav-hologram-stage');
        this.canvasBack = this.container.querySelector('.stav-particles-back');
        this.canvasFront = this.container.querySelector('.stav-particles-front');
        this.ctxBack = this.canvasBack.getContext('2d');
        this.ctxFront = this.canvasFront.getContext('2d');
        
        this.canvasBack.width = this.canvasFront.width = size.width;
        this.canvasBack.height = this.canvasFront.height = size.height;
    }
    
    createParticles() {
        class Particle {
            constructor(ctx, width, height) {
                this.ctx = ctx;
                this.width = width;
                this.height = height;
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * this.width;
                this.y = Math.random() * this.height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.size = Math.random() * 3 + 1;
                
                const colors = ['#00ffff', '#ff00ff', '#ffd700'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.5 + 0.3;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > this.width) this.vx *= -1;
                if (this.y < 0 || this.y > this.height) this.vy *= -1;
            }
            
            draw() {
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                this.ctx.fillStyle = this.color;
                this.ctx.globalAlpha = this.alpha;
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = this.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.globalAlpha = 1;
            }
        }
        
        const width = this.canvasBack.width;
        const height = this.canvasBack.height;
        
        for (let i = 0; i < 80; i++) {
            this.particles.push(new Particle(this.ctxBack, width, height));
        }
        for (let i = 0; i < 40; i++) {
            this.particles.push(new Particle(this.ctxFront, width, height));
        }
    }
    
    startAnimation() {
        const animate = () => {
            this.ctxBack.clearRect(0, 0, this.canvasBack.width, this.canvasBack.height);
            this.ctxFront.clearRect(0, 0, this.canvasFront.width, this.canvasFront.height);
            
            this.particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    speak() {
        this.state = 'speaking';
        this.stage.classList.add('stav-speaking');
    }
    
    listen() {
        this.state = 'listening';
        this.stage.classList.remove('stav-speaking');
    }
    
    demo() {
        this.speak();
        setTimeout(() => this.listen(), 3000);
    }
    
    setupEventListeners() {
        // Can be extended for custom events
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StavHologram;
}







