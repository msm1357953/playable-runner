import * as THREE from 'three';

export default class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2; // Seconds
    }

    spawn(zPos = -100) {
        // Random lane: -1, 0, 1
        const lane = Math.floor(Math.random() * 3) - 1;

        // Create Cube Obstacle
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0055,
            emissive: 0xff0000,
            emissiveIntensity: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(lane * 3, 1, zPos);

        this.scene.add(mesh);
        this.items.push({ mesh, active: true });
    }

    update(delta, speed) {
        // Spawning
        this.spawnTimer += delta;

        // Increase spawn rate based on speed
        const currentInterval = Math.max(0.5, 2 - (speed - 10) * 0.05);

        if (this.spawnTimer > currentInterval) {
            this.spawn();
            this.spawnTimer = 0;
        }

        // Movement & Cleanup
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.mesh.position.z += speed * delta;

            // Remove if passed camera
            if (item.mesh.position.z > 20) {
                this.scene.remove(item.mesh);
                item.mesh.geometry.dispose();
                item.mesh.material.dispose();
                this.items.splice(i, 1);
            }
        }
    }

    checkCollision(player) {
        const playerBox = new THREE.Box3().setFromObject(player.mesh);
        // Shrink player box slightly for forgiveness
        playerBox.expandByScalar(-0.2);

        for (const item of this.items) {
            const obstacleBox = new THREE.Box3().setFromObject(item.mesh);
            obstacleBox.expandByScalar(-0.1);

            if (playerBox.intersectsBox(obstacleBox)) {
                return true;
            }
        }
        return false;
    }

    reset() {
        for (const item of this.items) {
            this.scene.remove(item.mesh);
        }
        this.items = [];
        this.spawnTimer = 0;
    }
}
