import * as THREE from 'three';

export default class Particles {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    explode(position, color = 0xff0000, count = 20) {
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshBasicMaterial({ color: color });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);

            // Random velocity
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );

            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life: 1.0 });
        }
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.life -= delta;
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.mesh.rotation.x += delta * 5;
            p.mesh.rotation.y += delta * 5;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                // Material reused, don't dispose if shared? 
                // Actually created new material for batch in real engine, 
                // but here we shared nothing or created new. 
                // To be safe/simple let's just remove mesh.
                this.particles.splice(i, 1);
            }
        }
    }
}
