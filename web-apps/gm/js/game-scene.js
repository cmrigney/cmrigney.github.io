import { gameAssets } from './game-assets.js';
import { gameSettings } from './game-settings.js';
import { Types, EnterSide } from './game-types.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './game-sprite.js';
import { PlayerNode } from './player-node.js';
import { CastleNode } from './castle-node.js';
import { EnemyNode } from './enemy-node.js';
import { EnemyLookUp } from './enemy-lookup.js';
import { AttackLookUp } from './attack-lookup.js';
import { EnemyWaveAlgorithm } from './enemy-wave-algorithm.js';
import { WaveReader } from './wave-reader.js';
import { WaveTicketNode } from './wave-ticket-node.js';
import { AttackBox } from './attack-box.js';
import { CollectableAttack, CollectableBoost } from './collectable-node.js';

export class GameScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.attackBox = null;
        this.player = null;
        this.castle = null;
        this.protectorMonkey = null;
        this.enemies = new Array(20).fill(null);
        this.collectables = new Array(10).fill(null);

        this.nextEnemy = null;
        this.timeNext = 0;
        this.lastEnemy = false;
        this.lastEnemyOut = false;
        this.floorCollision = [];
        this.enterSide = EnterSide.left;
        this.defaultCastleHealth = 100;

        this.gamePaused = false;
        this.switchingWaves = false;
        this.awaitingCollection = false;
        this.switchingTimer = 0;
        this.intermissionTime = 3;

        this.waveTicket = null;
        this.resetArea = false;
        this.ignoreUpdate = false;
        this.inGameOver = false;

        this.waveDisplayColor = 'white';
        this.playerAccuracy = 'Accuracy: 100%';

        this.showSkillRound = false;
        this.showSkillRoundTimer = 0;
        this.showSkillRoundTotalTime = 4.5;

        this.showThrowWarning = false;
        this.showThrowWarningTimer = 0;
        this.showThrowWarningTotalTime = 4.0;
        this.warnedForWave = false;

        // Wave reading
        this.enemyQueue = [];
        this.leftToSpawn = 0;
        this.finishedWaveSet = false;
        this.totalWaves = 0;

        this.playerTouchBuffer = [];

        // Background image
        this.bgImage = null;

        this.initGame();
    }

    initGame() {
        gameSettings.initWaveData();
        if (!gameSettings.waveData) {
            gameSettings.waveData = new WaveReader(this.sceneManager.wavesText);
        }
        gameSettings.waveData.reset();
        gameSettings.currentWave = 1;

        this.lastEnemy = false;
        this.lastEnemyOut = false;
        this.gamePaused = false;
        this.inGameOver = false;

        // Castle
        const castleImg = gameAssets.getImage('castle');
        const cw = castleImg ? castleImg.width : 60;
        const ch = castleImg ? castleImg.height : 80;
        this.castle = new CastleNode(this, 0, 0, cw, ch, this.defaultCastleHealth);

        // Reset background (depends on castle)
        this.resetBackground();

        // Attack box
        this.attackBox = new AttackBox(5, 140);

        // Player
        this.player = new PlayerNode(this, 100, 25, this.floorCollision, 3);
        this.player.setAttackBox(this.attackBox);
        this.player.startMoving(1, 0);
        this.attackBox.player = this.player;

        // Enemies and collectables
        this.enemies = new Array(20).fill(null);
        this.collectables = new Array(10).fill(null);

        // Read first enemy
        this.readNextEnemy();
    }

    // Background management
    loadBackground() {
        let wave = gameSettings.currentWave;
        if (this.awaitingCollection) wave--;
        if (wave > 8) {
            wave = wave % 8;
            if (wave === 0) wave = 8;
        }

        const { bg, ground } = gameAssets.loadBackground(wave);
        this.bgImage = bg;

        // Set castle position and enter side per wave
        switch (wave) {
            case 1:
                this.castle.setX(730 - this.castle.width / 2);
                this.castle.setY(310 - this.castle.height);
                this.enterSide = EnterSide.left;
                this.waveDisplayColor = 'white';
                break;
            case 2:
                this.castle.setX(740 - this.castle.width / 2);
                this.castle.setY(410 - this.castle.height);
                this.enterSide = EnterSide.left;
                this.waveDisplayColor = 'black';
                break;
            case 3:
                this.castle.setX(350 - this.castle.width / 2);
                this.castle.setY(400 - this.castle.height);
                this.enterSide = EnterSide.both;
                this.waveDisplayColor = 'white';
                break;
            case 4:
                this.castle.setX(735 - this.castle.width / 2);
                this.castle.setY(375 - this.castle.height);
                this.enterSide = EnterSide.left;
                this.waveDisplayColor = 'white';
                break;
            case 5:
                this.castle.setX(60 - this.castle.width / 2);
                this.castle.setY(460 - this.castle.height);
                this.enterSide = EnterSide.right;
                this.waveDisplayColor = 'black';
                break;
            case 6:
                this.castle.setX(715 - this.castle.width / 2);
                this.castle.setY(405 - this.castle.height);
                this.enterSide = EnterSide.left;
                this.waveDisplayColor = 'white';
                break;
            case 7:
                this.castle.setX(712 - this.castle.width / 2);
                this.castle.setY(356 - this.castle.height);
                this.enterSide = EnterSide.left;
                this.waveDisplayColor = 'black';
                break;
            case 8:
                this.castle.setX(384 - this.castle.width / 2);
                this.castle.setY(452 - this.castle.height);
                this.enterSide = EnterSide.both;
                this.waveDisplayColor = 'white';
                break;
            default:
                this.castle.setX(384 - this.castle.width / 2);
                this.castle.setY(452 - this.castle.height);
                this.enterSide = EnterSide.both;
                this.waveDisplayColor = 'white';
                break;
        }

        this.generateFloorCollision(ground);
    }

    generateFloorCollision(groundImage) {
        this.floorCollision = new Array(800).fill(400);

        if (!groundImage) return;

        // Draw ground image to offscreen canvas to read pixels
        const offscreen = document.createElement('canvas');
        offscreen.width = groundImage.width;
        offscreen.height = groundImage.height;
        const offCtx = offscreen.getContext('2d');
        offCtx.drawImage(groundImage, 0, 0);

        const imgData = offCtx.getImageData(0, 0, groundImage.width, groundImage.height);
        const pixels = imgData.data;
        const gw = groundImage.width;
        const gh = groundImage.height;

        const scaleX = gw / gw; // 1.0 if ground matches its own size
        const scaleY = gh / gh;

        for (let xx = 0; xx < Math.min(gw, 800); xx++) {
            const imgX = Math.floor(xx * (gw / gw));
            let highestY = gh;
            for (let y = 0; y < gh; y++) {
                const pixelIndex = (y * gw + imgX) * 4;
                const alpha = pixels[pixelIndex + 3];
                if (alpha !== 0) {
                    highestY = Math.floor(y);
                    break;
                }
            }
            this.floorCollision[xx] = highestY + 480 - gh;
        }

        // Fill remaining
        if (gw < 800) {
            const lastVal = this.floorCollision[gw - 1];
            for (let xx = gw; xx < 800; xx++) {
                this.floorCollision[xx] = lastVal;
            }
        }
    }

    resetBackground() {
        this.loadBackground();
    }

    resetProtector() {
        if (!this.protectorMonkey) return;
        const pm = this.protectorMonkey;
        pm.setVelocity(0, 0);

        let eSide = this.enterSide;
        if (eSide === EnterSide.both) {
            eSide = Math.random() >= 0.5 ? EnterSide.left : EnterSide.right;
        }

        if (eSide === EnterSide.left) {
            pm.setX(this.castle.gameX - 58);
            const checkX = Math.max(0, Math.min(Math.floor(pm.gameX), this.floorCollision.length - 1));
            pm.setY(this.floorCollision[checkX] - pm.height);
            pm.setDirection(false);
        } else {
            pm.setX(this.castle.gameX + this.castle.width);
            const checkX = Math.max(0, Math.min(Math.floor(pm.gameX), this.floorCollision.length - 1));
            pm.setY(this.floorCollision[checkX] - pm.height);
            pm.setDirection(true);
        }
    }

    // Touch handling
    handleTouchDown(points) {
        if (this.inGameOver) return;

        if (this.gamePaused) {
            this.handlePauseTouches(points);
            return;
        }

        // Check pause button
        for (const touch of points) {
            if (touch.x >= 745 && touch.x <= 800 && touch.y >= 0 && touch.y <= 40) {
                this.gamePaused = true;
                return;
            }
        }

        // Forward to attack box
        this.attackBox.update(0, points);

        // Forward to wave ticket
        if (this.waveTicket) this.waveTicket.handleTouches(points);

        // Buffer for player
        this.playerTouchBuffer.push(...points);
    }

    handleTouchUp(points) {
        if (!this.inGameOver) return;

        for (const touch of points) {
            // Menu button
            if (touch.x >= 300 && touch.x <= 500 && touch.y >= 230 && touch.y <= 290) {
                this.sceneManager.switchScene('mainMenu');
                return;
            }
            // Retry button
            if (touch.x >= 300 && touch.x <= 500 && touch.y >= 310 && touch.y <= 370) {
                this.sceneManager.switchScene('game');
                return;
            }
        }
    }

    handlePauseTouches(touches) {
        for (const touch of touches) {
            // Resume button
            if (touch.x >= 156 && touch.x <= 356 && touch.y >= 268 && touch.y <= 335) {
                this.gamePaused = false;
            }
            // Sound toggle
            else if (touch.x >= 360 && touch.x <= 420 && touch.y >= 380 && touch.y <= 440) {
                gameSettings.soundEnabled = !gameSettings.soundEnabled;
                gameSettings.save();
            }
            // Quit
            else if (touch.x >= 441 && touch.x <= 631 && touch.y >= 268 && touch.y <= 335) {
                this.sceneManager.switchScene('mainMenu');
            }
        }
    }

    // Update
    update(deltaTime) {
        if (this.inGameOver) return;
        if (deltaTime > 0.1) deltaTime = 0.1;

        if (this.ignoreUpdate) {
            this.ignoreUpdate = false;
            this.playerTouchBuffer = [];
            return;
        }

        if (this.gamePaused) return;

        // Reset area for new wave
        if (this.resetArea) {
            this.waveTicket = null;
            this.resetArea = false;
            this.ignoreUpdate = true;
            this.resetBackground();
            this.player.updateFloor(this.floorCollision);
            this.player.resetAcc();
            this.resetProtector();
            this.readNextEnemy();
        }

        // Update attack box
        this.attackBox.update(deltaTime, []);

        // Update wave ticket
        if (this.waveTicket) this.waveTicket.updateTicket(deltaTime);

        // Update collectables
        for (let i = 0; i < this.collectables.length; i++) {
            if (this.collectables[i]) {
                this.collectables[i].updateSprite(deltaTime, [this.player]);
                if (this.collectables[i]) this.collectables[i].update(deltaTime);
            }
        }

        // Update castle
        this.castle.updateSprite(deltaTime, [this.player]);

        // Update player
        this.player.updateBase(deltaTime);
        this.player.addX(this.player.deltaVX);
        this.player.addY(this.player.deltaVY);
        this.player.updatePlayer(deltaTime, this.playerTouchBuffer);
        this.playerTouchBuffer = [];

        // Update attacks
        for (let i = 0; i < this.player.attacks.length; i++) {
            const attack = this.player.attacks[i];
            if (attack) {
                attack.updateSprite(deltaTime, this.enemies);
                if (this.player.attacks[i]) this.player.attacks[i].update(deltaTime);
            }
        }

        // Update enemies
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i]) {
                const collidables = [this.player, this.castle];
                if (this.protectorMonkey) collidables.push(this.protectorMonkey);
                this.enemies[i].updateSprite(deltaTime, collidables);
                if (this.enemies[i]) this.enemies[i].update(deltaTime);
            }
        }

        // Update protector
        if (this.protectorMonkey) {
            this.protectorMonkey.updateSprite(deltaTime, this.enemies);
            this.protectorMonkey.updateProtector(deltaTime);
        }

        // Enemy spawning
        if (!this.switchingWaves && !this.awaitingCollection) {
            if (!this.lastEnemyOut) {
                this.timeNext -= deltaTime;
                if (this.timeNext < 0.0001) {
                    if (this.nextEnemy) {
                        if (this.nextEnemy.constructor.name === 'EnemyThrowerNode' && !this.warnedForWave) {
                            this.warnedForWave = true;
                            this.showThrowWarning = true;
                            this.showThrowWarningTimer = 0;
                        }
                        const slot = this.getOpenEnemyPosition();
                        if (slot !== null) {
                            this.enemies[slot] = this.nextEnemy;
                            this.nextEnemy = null;
                            this.readNextEnemy();
                        }
                    }
                    if (this.lastEnemy) {
                        this.lastEnemyOut = true;
                    }
                }
            }

            if (this.lastEnemy && this.lastEnemyOut && this.allEnemiesDead()) {
                this.nextWave();
            }
        }

        // Wave switching timer
        if (this.switchingWaves) {
            this.switchingTimer += deltaTime;
            if (this.switchingTimer >= this.intermissionTime) {
                this.switchingTimer = 0;
                this.switchingWaves = false;
            }
        }

        // Skill round display timer
        if (this.showSkillRound) {
            this.showSkillRoundTimer += deltaTime;
            if (this.showSkillRoundTimer >= this.showSkillRoundTotalTime) {
                this.showSkillRound = false;
                this.showSkillRoundTimer = 0;
            }
        }

        // Throw warning timer
        if (this.showThrowWarning) {
            this.showThrowWarningTimer += deltaTime;
            if (this.showThrowWarningTimer >= this.showThrowWarningTotalTime) {
                this.showThrowWarning = false;
            }
        }
    }

    // Draw
    draw(ctx) {
        // Background
        if (this.bgImage) {
            ctx.drawImage(this.bgImage, 0, 0, 800, 480);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 800, 480);
        }

        // Castle
        this.castle.draw(ctx);

        // Protector
        if (this.protectorMonkey) {
            this.protectorMonkey.draw(ctx);
        }

        // Ice overlay (drawn behind enemies so they remain visible)
        for (const attack of this.player.attacks) {
            if (attack && attack.drawOverlay) attack.drawOverlay(ctx);
        }

        // Enemies
        for (const enemy of this.enemies) {
            if (enemy) enemy.draw(ctx);
        }

        // Collectables
        for (const c of this.collectables) {
            if (c) c.draw(ctx);
        }

        // Attacks
        for (const attack of this.player.attacks) {
            if (attack) attack.draw(ctx);
        }

        // Player
        this.player.draw(ctx);

        // Wave ticket
        if (this.waveTicket) this.waveTicket.draw(ctx);

        // Attack box
        this.attackBox.draw(ctx);

        // Text displayer
        this.player.getTextDisplayer().draw(ctx);

        // HUD
        this.drawHUD(ctx);

        // Pause overlay
        if (this.gamePaused) {
            this.drawPauseOverlay(ctx);
        }

        // Game over overlay
        if (this.inGameOver) {
            this.drawGameOverOverlay(ctx);
        }
    }

    drawHUD(ctx) {
        // Lives
        const livesImg = gameAssets.getImage('Lives');
        if (livesImg) {
            ctx.drawImage(livesImg, 196, 19);
        }
        ctx.save();
        ctx.font = 'bold 16px Helvetica, Arial, sans-serif';
        ctx.fillStyle = this.waveDisplayColor;
        ctx.textAlign = 'left';
        ctx.fillText(` x ${this.player.lives}`, 210, 30);
        ctx.restore();

        // Wave
        const waveNum = this.awaitingCollection ? gameSettings.currentWave - 1 : gameSettings.currentWave;
        ctx.save();
        ctx.font = 'bold 28px Helvetica, Arial, sans-serif';
        ctx.fillStyle = this.waveDisplayColor;
        ctx.textAlign = 'left';
        ctx.fillText(`Wave ${waveNum}`, 360, 28);
        ctx.restore();

        // Score
        ctx.save();
        ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.player.getScore()}`, 550, 20);
        ctx.restore();

        // Wave completed message
        if (this.switchingWaves) {
            ctx.save();
            ctx.font = 'bold 25px Helvetica, Arial, sans-serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText(`Wave ${gameSettings.currentWave - 1} Completed`, 400, 200);
            ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
            ctx.fillText(this.playerAccuracy, 400, 230);
            ctx.restore();
        }

        // Skill round
        if (this.showSkillRound) {
            const canEarnCompanion = !this.getProtector() && !(this.player.attackBox && this.player.attackBox.contains(Types.aProtector));
            ctx.save();
            ctx.font = 'bold 25px Helvetica, Arial, sans-serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('Skill Round!', 400, 280);
            if (canEarnCompanion) {
                ctx.fillText('Get over 100% accuracy for a companion', 400, 310);
                ctx.fillText('or over 80% for a strong special attack!', 400, 340);
            } else {
                ctx.fillText('Get over 80% for a strong special attack!', 400, 310);
            }
            ctx.restore();
        }

        // Throw warning
        if (this.showThrowWarning) {
            ctx.save();
            ctx.font = 'bold 35px Helvetica, Arial, sans-serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('Watch out for projectiles!', 400, 420);
            ctx.restore();
        }

        // Attack boost
        if (this.player.isAttackBoostMessage) {
            ctx.save();
            ctx.font = 'bold 25px Helvetica, Arial, sans-serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('Attack Power Boosted!', 400, 260);
            ctx.restore();
        }

        // Pause button
        ctx.save();
        ctx.font = 'bold 22px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('| |', 770, 22);
        ctx.restore();
    }

    drawPauseOverlay(ctx) {
        const pauseImg = gameAssets.getImage('pausescreen');
        if (pauseImg) {
            ctx.drawImage(pauseImg, 0, 0);
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, 800, 480);
            ctx.save();
            ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', 400, 200);
            ctx.restore();
        }

        // Sound icon
        const soundImgName = gameSettings.soundEnabled ? 'SOUNDON' : 'SOUNDOFF';
        const soundImg = gameAssets.getImage(soundImgName);
        if (soundImg) {
            ctx.drawImage(soundImg, 360, 380);
        }
    }

    drawGameOverOverlay(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 800, 480);

        ctx.save();
        ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', 400, 100);

        ctx.font = 'bold 22px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(this._gameOverMessage || '', 400, 140);

        ctx.font = 'bold 28px Helvetica, Arial, sans-serif';
        ctx.fillText(`Score: ${this.player.getScore()}   Wave: ${gameSettings.currentWave}`, 400, 180);

        // Menu button
        ctx.fillStyle = 'blue';
        ctx.fillRect(300, 230, 200, 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Helvetica, Arial, sans-serif';
        ctx.fillText('Main Menu', 400, 267);

        // Retry button
        ctx.fillStyle = 'green';
        ctx.fillRect(300, 310, 200, 60);
        ctx.fillStyle = 'white';
        ctx.fillText('Retry', 400, 347);
        ctx.restore();
    }

    // Wave management
    nextWave() {
        gameSettings.currentWave++;
        this.warnedForWave = false;

        // Attack boost every 10 waves
        if (gameSettings.currentWave % 10 === 0) {
            const boost = new CollectableBoost(this, 370, 300);
            this.addCollectable(boost);
        }

        this.lastEnemy = false;
        this.lastEnemyOut = false;
        this.player.nextWave();

        const accur = this.player.getAccuracy();
        this.playerAccuracy = `Accuracy: ${accur}%`;

        this.switchingWaves = true;
        this.awaitingCollection = true;

        // Create wave ticket
        this.waveTicket = new WaveTicketNode(this, 320, 30);

        // Skill round collectables
        if ((gameSettings.currentWave - 1) % 2 === 0) {
            let chosen = false;

            if (accur > 100) {
                if (!this.getProtector() && !(this.player.attackBox && this.player.attackBox.contains(Types.aProtector))) {
                    const ca = new CollectableAttack(this, Types.aProtector, 370, 400);
                    this.addCollectable(ca);
                    chosen = true;
                }
            }

            if (!chosen) {
                let collectType;
                if (accur >= 80) {
                    collectType = CollectableAttack.getRandomCollectableStrong();
                } else {
                    collectType = CollectableAttack.getRandomCollectableWeak();
                }
                const ca = new CollectableAttack(this, collectType, 370, 400);
                this.addCollectable(ca);
            }
        } else {
            const collectType = CollectableAttack.getRandomCollectable(1);
            const ca = new CollectableAttack(this, collectType, 370, 400);
            this.addCollectable(ca);
        }
    }

    ticketCollected() {
        this.resetArea = true;
        this.awaitingCollection = false;
        this.player.ignoreInput();
        this.player.reset(100, 25);
        this.player.startMoving(1, 0);
        if (gameSettings.currentWave % 2 === 0) {
            this.showSkillRound = true;
        }
    }

    // Enemy reading
    readNextEnemy() {
        if (this.nextEnemy || this.lastEnemy) return;

        if (this.leftToSpawn > 0 && this.enemyQueue.length > 0) {
            this.nextEnemy = this.enemyQueue.shift();
            this.timeNext = EnemyWaveAlgorithm.getNextTime();
            this.leftToSpawn--;
            return;
        }

        if (!gameSettings.waveData) return;

        const data = this.readNextValidLine(gameSettings.waveData);
        if (!data) return;

        if (data.startsWith('@')) {
            gameSettings.waveData = new WaveReader(this.sceneManager.wavesText);
            gameSettings.waveData.reset();
            this.finishedWaveSet = true;
            const newData = this.readNextValidLine(gameSettings.waveData);
            if (!newData) return;
            this.processWaveLine(newData);
            return;
        }

        this.processWaveLine(data);
    }

    processWaveLine(data) {
        if (!gameSettings.waveData) return;

        if (data.startsWith('~')) {
            this.timeNext = 0;
            this.lastEnemy = true;
            if (!this.finishedWaveSet) this.totalWaves++;
            return;
        }

        const enemyType = parseInt(data.trim()) || 100;
        const healthStr = this.readNextValidLine(gameSettings.waveData) || '15';
        const health = parseInt(healthStr.trim()) || 15;
        const walkStr = this.readNextValidLine(gameSettings.waveData) || '20';
        const walkSpeed = parseFloat(walkStr.trim()) || 20;
        const damStr = this.readNextValidLine(gameSettings.waveData) || '5';
        const attackDamage = parseFloat(damStr.trim()) || 5;
        const timeStr = this.readNextValidLine(gameSettings.waveData) || '1';
        this.timeNext = parseFloat(timeStr.trim()) || 1;

        EnemyLookUp.resolve(enemyType, this.floorCollision, this.enterSide);

        let numberOfSpawns = 1;
        let scaledHealth = health;
        let scaledDamage = Math.floor(attackDamage);

        if (this.finishedWaveSet) {
            const factor = (gameSettings.currentWave + this.totalWaves) / this.totalWaves;
            EnemyWaveAlgorithm.run(factor);
            numberOfSpawns = EnemyWaveAlgorithm.numOfEnemies;
            scaledHealth = Math.floor(health * EnemyWaveAlgorithm.healthFactor);
            scaledDamage = Math.floor(attackDamage * EnemyWaveAlgorithm.attackDamageFactor);
        }

        this.leftToSpawn = numberOfSpawns - 1;

        for (let i = 0; i < numberOfSpawns; i++) {
            let speed;
            if (i === 0) {
                speed = walkSpeed;
            } else {
                speed = walkSpeed * (0.5 + Math.random());
            }

            const enemy = EnemyLookUp.createEnemy(
                this, EnemyLookUp.resolvedSheetName,
                enemyType, EnemyLookUp.resolvedX, EnemyLookUp.resolvedY,
                EnemyLookUp.resolvedWidth, EnemyLookUp.resolvedHeight,
                EnemyLookUp.resolvedXBounds, EnemyLookUp.resolvedYBounds,
                EnemyLookUp.resolvedBoundsScale, scaledHealth,
                scaledDamage, speed,
                this.floorCollision, EnemyLookUp.resolvedDir
            );

            if (i === 0) {
                this.nextEnemy = enemy;
            } else {
                this.enemyQueue.push(enemy);
            }
        }
    }

    readNextValidLine(reader) {
        let line = reader.readLine();
        while (line !== null && line.startsWith('-')) {
            line = reader.readLine();
        }
        return line;
    }

    // Helpers
    getOpenEnemyPosition() {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i] === null) return i;
        }
        return null;
    }

    allEnemiesDead() {
        return this.enemies.every(e => e === null);
    }

    getPlayer() { return this.player; }
    getCastle() { return this.castle; }
    getProtector() { return this.protectorMonkey; }
    getEnemies() { return this.enemies; }

    setProtector(pm) {
        this.protectorMonkey = pm;
        if (this.finishedWaveSet) {
            pm.upgrade((gameSettings.currentWave + this.totalWaves) / this.totalWaves);
        }
    }

    notifyDeadProtector() {
        if (this.protectorMonkey) this.protectorMonkey.dispose();
        this.protectorMonkey = null;
    }

    addCollectable(c) {
        for (let i = 0; i < this.collectables.length; i++) {
            if (this.collectables[i] === null) {
                this.collectables[i] = c;
                break;
            }
        }
    }

    removeCollectable(c) {
        for (let i = 0; i < this.collectables.length; i++) {
            if (this.collectables[i] === c) {
                if (this.collectables[i]) this.collectables[i].dispose();
                this.collectables[i] = null;
                break;
            }
        }
    }

    notifyEnemyDead(enemy) {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i] === enemy) {
                if (this.enemies[i]) this.enemies[i].dispose();
                this.enemies[i] = null;
                break;
            }
        }
    }

    addEnemy(en) {
        const slot = this.getOpenEnemyPosition();
        if (slot !== null) {
            this.enemies[slot] = en;
        }
    }

    allowCollect() {
        for (const c of this.collectables) {
            if (c) c.setCollidable(true);
        }
    }

    triggerGameOver(message) {
        this.inGameOver = true;
        this._gameOverMessage = message;
        gameSettings.addScore('Player', this.player.getScore(), gameSettings.currentWave);
    }
}
