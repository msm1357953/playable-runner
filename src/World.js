import * as THREE from 'three';

export default class World {
    constructor(scene) {
        this.scene = scene;
        this.speed = 10; // Global game speed
        this.setupFloor();
        this.createStarfield();
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });

        const starVertices = [];
        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    setupFloor() {
        // Create a basic infinite grid illusion
        // We use two grid helpers and move them to create the loop

        const size = 100;
        const divisions = 100;

        this.grid1 = new THREE.GridHelper(size, divisions, 0xff00ff, 0x220033);
        this.grid1.position.z = 0;
        this.scene.add(this.grid1);

        this.grid2 = new THREE.GridHelper(size, divisions, 0xff00ff, 0x220033);
        this.grid2.position.z = -size;
        this.scene.add(this.grid2);

        // Add a reflective floor plane below the grid for "glow" look
        const planeGeo = new THREE.PlaneGeometry(size, size * 2);
        const planeMat = new THREE.MeshBasicMaterial({
            color: 0x000011,
            side: THREE.DoubleSide
        });
        this.floor = new THREE.Mesh(planeGeo, planeMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.y = -0.1; // Slightly below grid
        this.floor.position.z = -50;
        this.scene.add(this.floor);
    }

    update(delta, speed) {
        // Move grids towards camera
        // Use passed speed if available, or fallback
        const currentSpeed = speed || this.speed;
        const moveDistance = currentSpeed * delta;

        this.grid1.position.z += moveDistance;
        this.grid2.position.z += moveDistance;

        // Reset if passed camera
        // Grid size is 100. If z > 50 (camera is at 10, so roughly), reset.
        // Actually, if it moves by 'size', we reset.
        if (this.grid1.position.z >= 50) {
            this.grid1.position.z = this.grid2.position.z - 100;
        }
        if (this.grid2.position.z >= 50) {
            this.grid2.position.z = this.grid1.position.z - 100;
        }
    }
}
