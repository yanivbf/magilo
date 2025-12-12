// 🎭 Stav 3D Avatar Controller - Advanced Interactive Character
// This module creates a fully interactive 3D holographic character

class Stav3DAvatar {
    constructor(containerElement) {
        this.container = containerElement;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.avatar = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animations = {};
        this.currentAnimation = null;
        this.isSpeaking = false;
        this.particles = null;
        
        this.init();
    }

    init() {
        console.log('🎬 Initializing Stav 3D Avatar...');
        
        // Create Scene
        this.scene = new THREE.Scene();
        
        // Create Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 2.5);
        
        // Create Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        this.container.appendChild(this.renderer.domElement);
        
        // Setup Scene Elements
        this.setupLights();
        this.setupHolographicEffects();
        this.createAvatar();
        
        // Handle Resize
        window.addEventListener('resize', () => this.onResize());
        
        // Start Animation Loop
        this.animate();
        
        console.log('✅ Stav 3D Avatar Ready!');
    }

    setupLights() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Main Light (Key Light)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(3, 5, 3);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        // Fill Light (Purple - holographic effect)
        const fillLight = new THREE.PointLight(0x667eea, 1.5, 5);
        fillLight.position.set(-2, 2, 1);
        this.scene.add(fillLight);
        
        // Rim Light (Pink - holographic effect)
        const rimLight = new THREE.PointLight(0x764ba2, 1.5, 5);
        rimLight.position.set(2, 1, -1);
        this.scene.add(rimLight);
        
        // Store lights for animation
        this.lights = { fillLight, rimLight };
    }

    setupHolographicEffects() {
        // Create particle system for holographic effect
        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position around avatar
            positions[i * 3] = (Math.random() - 0.5) * 3;
            positions[i * 3 + 1] = Math.random() * 3;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
            
            // Purple/pink color gradient
            const t = Math.random();
            colors[i * 3] = 0.4 + t * 0.2; // R
            colors[i * 3 + 1] = 0.5 - t * 0.2; // G
            colors[i * 3 + 2] = 0.8 + t * 0.2; // B
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createAvatar() {
        // Create holographic humanoid avatar
        const avatarGroup = new THREE.Group();
        
        // Body (capsule)
        const bodyGeometry = new THREE.CapsuleGeometry(0.25, 1.0, 8, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x667eea,
            emissive: 0x667eea,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.85,
            shininess: 100,
            side: THREE.DoubleSide
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.22, 32, 32);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x764ba2,
            emissive: 0x764ba2,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.85,
            shininess: 100
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        
        // Glow effect around head
        const glowGeometry = new THREE.SphereGeometry(0.26, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 1.8;
        
        // Add all parts to group
        avatarGroup.add(body);
        avatarGroup.add(head);
        avatarGroup.add(glow);
        
        // Store references
        this.avatar = avatarGroup;
        this.avatarHead = head;
        this.avatarBody = body;
        this.avatarGlow = glow;
        
        this.scene.add(avatarGroup);
        
        // Add floating animation data
        this.floatOffset = 0;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // Floating animation
        if (this.avatar) {
            this.floatOffset += delta * 0.5;
            this.avatar.position.y = Math.sin(this.floatOffset) * 0.1;
            
            // Gentle rotation
            this.avatar.rotation.y = Math.sin(time * 0.2) * 0.1;
        }
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += delta * 0.1;
            
            // Animate particle positions (floating effect)
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + i) * 0.0005;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animate lights (pulsing effect)
        if (this.lights) {
            this.lights.fillLight.intensity = 1.5 + Math.sin(time * 2) * 0.3;
            this.lights.rimLight.intensity = 1.5 + Math.cos(time * 2) * 0.3;
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Public Methods
    startSpeaking() {
        console.log('🗣️ Stav starts speaking');
        this.isSpeaking = true;
        
        // Add speaking animation
        if (this.avatarHead) {
            this.speakingInterval = setInterval(() => {
                if (!this.isSpeaking) {
                    clearInterval(this.speakingInterval);
                    return;
                }
                
                // Head bob
                this.avatarHead.position.y = 1.8 + Math.sin(Date.now() * 0.02) * 0.02;
                
                // Glow pulse
                if (this.avatarGlow) {
                    this.avatarGlow.material.opacity = 0.2 + Math.sin(Date.now() * 0.01) * 0.1;
                }
            }, 16);
        }
    }

    stopSpeaking() {
        console.log('🔇 Stav stops speaking');
        this.isSpeaking = false;
        
        // Reset positions
        if (this.avatarHead) {
            this.avatarHead.position.y = 1.8;
        }
        if (this.avatarGlow) {
            this.avatarGlow.material.opacity = 0.2;
        }
    }

    wave() {
        console.log('👋 Stav waves');
        // Animation: tilt body side to side
        if (this.avatar) {
            let time = 0;
            const waveInterval = setInterval(() => {
                time += 0.1;
                this.avatar.rotation.z = Math.sin(time * 5) * 0.3;
                
                if (time > 2) {
                    clearInterval(waveInterval);
                    this.avatar.rotation.z = 0;
                }
            }, 16);
        }
    }

    point() {
        console.log('👉 Stav points');
        // Animation: rotate and lean forward
        if (this.avatar) {
            const originalRotation = { ...this.avatar.rotation };
            let progress = 0;
            
            const pointInterval = setInterval(() => {
                progress += 0.05;
                
                if (progress < 0.5) {
                    // Lean forward
                    this.avatar.rotation.x = progress * 0.4;
                    this.avatar.rotation.y = progress * 0.6;
                } else {
                    // Return to original
                    const returnProgress = (progress - 0.5) * 2;
                    this.avatar.rotation.x = (1 - returnProgress) * 0.2;
                    this.avatar.rotation.y = (1 - returnProgress) * 0.3;
                }
                
                if (progress >= 1) {
                    clearInterval(pointInterval);
                    this.avatar.rotation.x = originalRotation.x;
                    this.avatar.rotation.y = originalRotation.y;
                }
            }, 16);
        }
    }

    hide() {
        if (this.container) {
            this.container.style.opacity = '0';
            this.container.style.pointerEvents = 'none';
        }
    }

    show() {
        if (this.container) {
            this.container.style.opacity = '1';
        }
    }

    destroy() {
        // Cleanup
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Export for use in marketplace
window.Stav3DAvatar = Stav3DAvatar;









