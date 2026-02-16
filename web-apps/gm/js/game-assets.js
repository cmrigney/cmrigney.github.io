import { audioManager } from './audio-manager.js';

class GameAssetsClass {
    constructor() {
        // Constants
        this.numBananaShotAnim = 7;
        this.playerFrames = 11;
        this.playerAttackFrames = 2;
        this.wholeExplosionFrames = 23;
        this.wholeExplosionWidth = 5;
        this.wholeExplosionSize = 64;
        this.wholeExplosionSpeed = 15;

        // Enemy frame counts [standing, walking, attacking]
        this.zooKeeperFrames = [2, 8, 5];
        this.paperBoyFrames = [2, 8, 4];
        this.timFrames = [2, 4, 5];
        this.copFrames = [1, 6, 6];
        this.rhinoFrames = [1, 9, 3];
        this.zombieMonkeyFrames = [1, 7, 4];
        this.jugFrames = [1, 8, 4];
        this.newspaperFrames = 5;
        this.bulletFrames = 4;
        this.knifeFrames = 4;

        // All images stored as Image objects
        this.images = {};
        this.loaded = false;
    }

    async loadAll() {
        const imageNames = [
            'monkeyAnimations', 'castle', 'Lives', 'pausescreen', 'iceBlock',
            'bananaAttackBoost', 'hitMarker',
            // Enemies
            'zookeeperAnimations', 'paperboyanimations', 'timanimations',
            'copanimations', 'rhinoAnimations', 'zombieMonkeyAnimations',
            'jugAnimations', 'newspaper', 'bullet', 'knife',
            // Attack boxes
            'NothingAttackBox', 'EquipAttackBox', 'WaveTicket',
            'bananaAttackBox', 'bananaAutoAttackBox', 'bananaBombAttackBox',
            'bananaClusterAttackBox', 'bananaBlackHoleBox', 'bananaIceAttackBox',
            'protectorBox',
            // Attacks
            'BananaShot', 'BananaBomb', 'BananaBlackHole', 'iceBanana',
            'BananaClusterBomb',
            // Protector
            'protectMonkeyAnimations',
            // Explosions
            'wholeExplosion',
            // Menu
            'menuBG', 'howToPlay', 'HighScoremenuFull',
            // Sound icons
            'SOUNDON', 'SOUNDOFF',
            // Backgrounds and grounds
            'riverBG', 'riverGround', 'rockiesBG', 'rockiesGround',
            'cityBG', 'cityGround', 'spaceBG', 'spaceGround',
            'shipBG', 'shipGround', 'desertBG', 'desertGround',
            'hillyBG', 'hillyGround', 'beachBG', 'beachGround',
            // Memorial
            'sean-coxwell-memorial', 'sean-coxwell-small',
            // Buttons
            'buttons'
        ];

        const promises = imageNames.map(name => this.loadImage(name));
        await Promise.all(promises);

        // Audio
        audioManager.preload();
        this.loaded = true;
    }

    loadImage(name) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                resolve();
            };
            img.onerror = () => {
                // Create a 1x1 transparent fallback
                this.images[name] = null;
                resolve();
            };
            img.src = `assets/${name}.png`;
        });
    }

    getImage(name) {
        return this.images[name] || null;
    }

    // Load background pair for a wave number
    loadBackground(wave) {
        let w = wave;
        if (w > 8) {
            w = w % 8;
            if (w === 0) w = 8;
        }

        let bgName, groundName;
        switch (w) {
            case 1: bgName = 'riverBG'; groundName = 'riverGround'; break;
            case 2: bgName = 'rockiesBG'; groundName = 'rockiesGround'; break;
            case 3: bgName = 'cityBG'; groundName = 'cityGround'; break;
            case 4: bgName = 'spaceBG'; groundName = 'spaceGround'; break;
            case 5: bgName = 'shipBG'; groundName = 'shipGround'; break;
            case 6: bgName = 'desertBG'; groundName = 'desertGround'; break;
            case 7: bgName = 'hillyBG'; groundName = 'hillyGround'; break;
            case 8: bgName = 'beachBG'; groundName = 'beachGround'; break;
            default: bgName = 'beachBG'; groundName = 'beachGround'; break;
        }

        return { bg: this.getImage(bgName), ground: this.getImage(groundName) };
    }

    // Resolve attack box image name by type
    resolveAttackBoxImageName(type) {
        switch (type) {
            case 1000: return 'bananaAttackBox';
            case 1004: return 'bananaClusterAttackBox';
            case 1003: return 'bananaBombAttackBox';
            case 1001: return 'bananaAttackBox';
            case 1005: return 'bananaAutoAttackBox';
            case 1006: return 'bananaBlackHoleBox';
            case 1002: return 'bananaIceAttackBox';
            case 1007: return 'protectorBox';
            default: return 'bananaAttackBox';
        }
    }

    /**
     * Draw a frame from a sprite sheet onto the canvas.
     * srcX, srcY, srcW, srcH: source rectangle in the sprite sheet
     * destX, destY: destination position on canvas (top-left)
     * flipped: if true, draw mirrored horizontally
     */
    drawFrame(ctx, sheetName, srcX, srcY, srcW, srcH, destX, destY, flipped) {
        const img = this.images[sheetName];
        if (!img) return;
        this.drawFrameFromImage(ctx, img, srcX, srcY, srcW, srcH, destX, destY, srcW, srcH, flipped);
    }

    drawFrameFromImage(ctx, img, srcX, srcY, srcW, srcH, destX, destY, destW, destH, flipped) {
        if (!img) return;
        if (flipped) {
            ctx.save();
            ctx.translate(destX + destW, destY);
            ctx.scale(-1, 1);
            ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, destW, destH);
            ctx.restore();
        } else {
            ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
        }
    }
}

export const gameAssets = new GameAssetsClass();
