import { gameAssets } from './game-assets.js';
import { gameSettings } from './game-settings.js';
import { WaveReader } from './wave-reader.js';
import { LoadingScene } from './loading-scene.js';
import { MemorialScene } from './memorial-scene.js';
import { MainMenuScene } from './main-menu-scene.js';
import { GameScene } from './game-scene.js';
import { HowToPlayScene } from './how-to-play-scene.js';
import { HighScoreScene } from './high-score-scene.js';
import { CreditsScene } from './credits-scene.js';

class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentScene = null;
        this.lastTime = 0;
        this.wavesText = '';

        // Virtual resolution
        this.virtualWidth = 800;
        this.virtualHeight = 480;

        // Scaling
        this.scaleX = 1;
        this.scaleY = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.setupCanvas();
        this.setupInput();

        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;

        // Aspect-fit scaling
        const scaleW = windowW / this.virtualWidth;
        const scaleH = windowH / this.virtualHeight;
        const scale = Math.min(scaleW, scaleH);

        const canvasW = Math.floor(this.virtualWidth * scale);
        const canvasH = Math.floor(this.virtualHeight * scale);

        this.canvas.style.width = canvasW + 'px';
        this.canvas.style.height = canvasH + 'px';

        this.scaleX = this.virtualWidth / canvasW;
        this.scaleY = this.virtualHeight / canvasH;

        // Get canvas position for offset calculation
        const rect = this.canvas.getBoundingClientRect();
        this.offsetX = rect.left;
        this.offsetY = rect.top;

        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
    }

    setupInput() {
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const points = this.getTouchPoints(e.changedTouches);
            if (this.currentScene && this.currentScene.handleTouchDown) {
                this.currentScene.handleTouchDown(points);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const points = this.getTouchPoints(e.changedTouches);
            if (this.currentScene && this.currentScene.handleTouchUp) {
                this.currentScene.handleTouchUp(points);
            }
        }, { passive: false });

        // Mouse events (desktop fallback)
        this.canvas.addEventListener('mousedown', (e) => {
            const point = this.getMousePoint(e);
            if (this.currentScene && this.currentScene.handleTouchDown) {
                this.currentScene.handleTouchDown([point]);
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            const point = this.getMousePoint(e);
            if (this.currentScene && this.currentScene.handleTouchUp) {
                this.currentScene.handleTouchUp([point]);
            }
        });

        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    getTouchPoints(touchList) {
        const rect = this.canvas.getBoundingClientRect();
        const points = [];
        for (let i = 0; i < touchList.length; i++) {
            const t = touchList[i];
            points.push({
                x: (t.clientX - rect.left) * this.scaleX,
                y: (t.clientY - rect.top) * this.scaleY
            });
        }
        return points;
    }

    getMousePoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * this.scaleX,
            y: (e.clientY - rect.top) * this.scaleY
        };
    }

    switchScene(name) {
        switch (name) {
            case 'loading':
                this.currentScene = new LoadingScene(this);
                break;
            case 'memorial':
                this.currentScene = new MemorialScene(this);
                break;
            case 'mainMenu':
                this.currentScene = new MainMenuScene(this);
                break;
            case 'game':
                this.currentScene = new GameScene(this);
                break;
            case 'howToPlay':
                this.currentScene = new HowToPlayScene(this);
                break;
            case 'highScore':
                this.currentScene = new HighScoreScene(this);
                break;
            case 'credits':
                this.currentScene = new CreditsScene(this);
                break;
        }

    }

    gameLoop(timestamp) {
        const deltaTime = this.lastTime === 0 ? 0 : (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.currentScene) {
            this.currentScene.update(deltaTime);

            // Clear
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

            this.currentScene.draw(this.ctx);
        }

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    async start() {
        // Show loading scene
        this.switchScene('loading');
        requestAnimationFrame((ts) => this.gameLoop(ts));

        // Load waves.txt
        const loadingScene = this.currentScene;
        try {
            loadingScene.setProgress(0.1, 'Loading wave data...');
            const response = await fetch('assets/waves.txt');
            this.wavesText = await response.text();
        } catch (e) {
            console.error('Failed to load waves.txt:', e);
            this.wavesText = '';
        }

        // Load settings
        loadingScene.setProgress(0.2, 'Loading settings...');
        gameSettings.load();
        gameSettings.waveData = new WaveReader(this.wavesText);

        // Load all assets
        loadingScene.setProgress(0.3, 'Loading textures...');
        await gameAssets.loadAll();

        loadingScene.setProgress(1.0, 'Ready to defend!');

        // Small delay then transition
        await new Promise(resolve => setTimeout(resolve, 500));

        // Show memorial or go to main menu
        if (!gameSettings.hasShownMemorial) {
            gameSettings.hasShownMemorial = true;
            gameSettings.save();
            this.switchScene('memorial');
        } else {
            this.switchScene('mainMenu');
        }
    }
}

// Initialize
const canvas = document.getElementById('gameCanvas');
const sceneManager = new SceneManager(canvas);
sceneManager.start();
