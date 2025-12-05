import * as THREE from 'three';

export default class Player {
    constructor(scene) {
        this.scene = scene;
        this.position = new THREE.Vector3(0, 0.5, 0); // Player pos
        this.targetX = 0;
        this.lane = 0; // -1 (Left), 0 (Center), 1 (Right)

        this.initMesh();
        this.initInput();
    }

    initMesh() {
        // Simple futuristic ship shape (Cone + Wings)
        const geometry = new THREE.ConeGeometry(0.5, 2, 8);
        geometry.rotateX(Math.PI / 2); // Point forward

        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x0088ff,
            emissiveIntensity: 0.5,
            roughness: 0.4,
            metalness: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Engine glow
        const glowGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        this.engineGlow = new THREE.Mesh(glowGeo, glowMat);
        this.engineGlow.position.set(0, 0, 1);
        this.mesh.add(this.engineGlow);
    }

    initInput() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight();
                    break;
            }
        });

        // Mobile touch controls
        window.addEventListener('touchstart', (e) => {
            const touchX = e.touches[0].clientX;
            const width = window.innerWidth;

            if (touchX < width / 2) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        });
    }

    moveLeft() {
        if (this.lane > -1) {
            this.lane--;
            this.updateTarget();
        }
    }

    moveRight() {
        if (this.lane < 1) {
            this.lane++;
            this.updateTarget();
        }
    }

    updateTarget() {
        // Lane width = 3 units
        this.targetX = this.lane * 3;
    }

    update(delta) {
        // Smooth lerp to target lane
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * delta * 10;

        // Slight tilt effect
        this.mesh.rotation.z = -(this.mesh.position.x - this.targetX) * 0.1;

        // Pulse engine
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
        this.engineGlow.scale.setScalar(scale);
    }
}
