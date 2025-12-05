import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import World from './World.js';
import Player from './Player.js';
import Obstacles from './Obstacles.js';
import Particles from './Particles.js';
import AdAdapter from './AdAdapter.js';

export default class Game {
    constructor() {
        this.container = document.querySelector('#app');
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02); // Distance fog

        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 3, 10);
        this.camera.lookAt(0, 0, -20);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);

        // Post-processing
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(bloomPass);

        // Helpers
        // const gridHelper = new THREE.GridHelper(200, 200, 0x00ffff, 0x222222);
        // this.scene.add(gridHelper);

        // Game Objects
        this.world = new World(this.scene);
        this.player = new Player(this.scene);
        this.obstacles = new Obstacles(this.scene);
        this.particles = new Particles(this.scene);
        this.adAdapter = new AdAdapter();
        this.adAdapter.gameReady();

        // State
        this.isPlaying = false;
        this.score = 0;
        this.gameSpeed = 20;
        this.scoreElement = document.getElementById('score');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over');

        this.init();

        // UI Events
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());

        // Add CTA Overlay or listener
        // Make sure game over click redirects to store? 
        // Or add a specific install button if requested. 
        // For now, let's make the "Game Over" screen have an "Install" button too, or just clicking anywhere on game over?
        // Let's stick to adding a explicit CTA button.

        this.createCTAButton();
    }

    createCTAButton() {
        const btn = document.createElement('button');
        btn.innerText = 'INSTALL NOW';
        btn.style.position = 'absolute';
        btn.style.bottom = '20px';
        btn.style.left = '50%';
        btn.style.transform = 'translateX(-50%)';
        btn.style.background = '#0f0';
        btn.style.color = '#000';
        btn.style.fontSize = '1.2rem';
        btn.style.fontWeight = 'bold';
        btn.style.border = 'none';
        btn.style.padding = '10px 20px';
        btn.style.cursor = 'pointer';
        btn.style.zIndex = '1000';
        btn.style.boxShadow = '0 0 10px #0f0';

        btn.addEventListener('click', () => {
            this.adAdapter.install();
        });

        document.getElementById('ui-layer').appendChild(btn);
    }

    init() {
        this.clock = new THREE.Clock();
        // Don't start loop until clicked, or loop but don't move?
        // Let's loop but check isPlaying
        this.renderer.setAnimationLoop(this.update.bind(this));
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.gameSpeed = 20;
        this.scoreElement.innerText = '0';

        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';

        this.obstacles.reset();
        // Reset player? 
        this.player.lane = 0;
        this.player.updateTarget();
        this.player.mesh.position.x = 0;

        this.adAdapter.gameStarted();
    }

    gameOver() {
        this.isPlaying = false;
        this.gameOverScreen.style.display = 'block';
        this.adAdapter.gameEnded();
    }

    onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
    }

    update() {
        // requestAnimationFrame(this.update.bind(this)); // Handled by setAnimationLoop

        const delta = this.clock.getDelta();

        if (this.isPlaying) {
            // Update logic
            this.gameSpeed += delta * 0.5; // Increase speed

            this.world.update(delta, this.gameSpeed);
            this.player.update(delta);
            this.obstacles.update(delta, this.gameSpeed);
            this.particles.update(delta);

            // Score
            this.score += this.gameSpeed * delta * 0.1;
            this.scoreElement.innerText = Math.floor(this.score);

            // Collision
            if (this.obstacles.checkCollision(this.player)) {
                this.particles.explode(this.player.mesh.position, 0x00ffff, 50);
                this.gameOver();
                // Screen shake?
                this.camera.position.x = (Math.random() - 0.5) * 1;
            } else {
                // Smooth camera follow
                this.camera.position.x += (this.player.mesh.position.x * 0.3 - this.camera.position.x) * delta * 5;
            }
        } else {
            // Idle animation
            this.world.update(delta, 5);
            this.particles.update(delta);
        }

        this.composer.render();
    }
}
