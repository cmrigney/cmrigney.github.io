import { AttackRotatingSimple } from './attack-rotating-simple.js';
import { getAttackPoints } from './points-lookup.js';
import { audioManager } from './audio-manager.js';
import { SCREEN_HEIGHT } from './game-sprite.js';

export class AttackBlackHole extends AttackRotatingSimple {
    constructor(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, friction, gravity, damage) {
        super(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, friction, gravity, damage);

        this._exploding = false;
        this._timer = 6.0;
        this._growing = true;
        this._growVisible = true;

        this._holeRadius = 25;
        this._MAX_RADIUS = 550;
        this._MIN_RADIUS = 25;
        this._sizeChange = 100;

        this._trans = 128;
        this._MAX_TRANS = 200;
        this._MIN_TRANS = 60;
        this._transChange = 350;

        this._suckIn = true;
    }

    eventCollided(sprite) {
        if (sprite.type >= 100 && sprite.type <= 500) {
            this.doExplode();
        }
    }

    update(deltaTime) {
        if (this._exploding) {
            this._timer -= deltaTime;
            if (this._timer <= 0) {
                if (this.player) this.player.destroyAttack(this);
                return;
            }

            if (this._growing) {
                if (this._suckIn) {
                    const enemies = this.player?.screen?.getEnemies() || [];
                    for (const enemy of enemies) {
                        if (!enemy) continue;
                        if (!enemy.isPulling && this.player) this.player.hitSuccess();
                        enemy.gravitateToward(Math.floor(this.gameX), Math.floor(this.gameY), 60);
                        enemy.setCollidable(false);
                    }
                }
                this._holeRadius += this._sizeChange * deltaTime;
                if (this._holeRadius >= this._MAX_RADIUS) {
                    this._growing = false;
                    this._holeRadius = this._MAX_RADIUS - (this._holeRadius - this._MAX_RADIUS);
                    this._sizeChange = 1300;
                }
            } else {
                this._holeRadius -= this._sizeChange * deltaTime;
                if (this._holeRadius <= this._MIN_RADIUS) {
                    this._growing = true;
                    this._holeRadius = this._MIN_RADIUS + (this._MIN_RADIUS - this._holeRadius);
                    const enemies = this.player?.screen?.getEnemies() || [];
                    for (const enemy of enemies) {
                        if (!enemy) continue;
                        const rx = Math.floor(this.gameX) + Math.floor((Math.random() - 0.5) * 30);
                        enemy.gravitateAway(rx, Math.floor(this.gameY) + 10, 500);
                        enemy.takeDelayedDamage(this.damage, 1);
                        enemy.setIgnoreFloor(true);
                    }
                    this._suckIn = false;
                    this._MAX_RADIUS = 10000;
                }
            }

            // Transparency cycling
            if (this._growVisible) {
                this._trans -= this._transChange * deltaTime;
                if (this._trans <= this._MIN_TRANS) {
                    this._growVisible = false;
                    this._trans = this._MIN_TRANS + (this._MIN_TRANS - this._trans);
                }
            } else {
                this._trans += this._transChange * deltaTime;
                if (this._trans >= this._MAX_TRANS) {
                    this._growVisible = true;
                    this._trans = this._MAX_TRANS - (this._trans - this._MAX_TRANS);
                }
            }
            return;
        }

        this.doAnimation(deltaTime);
        this.doPhysics(deltaTime);

        const checkX = Math.floor(this.gameX) + Math.floor(this.width / 2);
        if (checkX >= 0 && checkX < this.floor.length) {
            if (this.gameY + this.height > this.floor[checkX]) {
                this.doExplode();
                return;
            }
        } else if (this.gameY >= SCREEN_HEIGHT) {
            this.doExplode();
            return;
        }
    }

    doExplode() {
        this._exploding = true;
        this.setVelocity(0, 0);
        if (this.player) {
            this.player.givePoints(getAttackPoints(this.type));
            const enemies = this.player.screen?.getEnemies() || [];
            for (const enemy of enemies) {
                if (!enemy) continue;
                this.player.hitSuccess();
                enemy.gravitateToward(Math.floor(this.gameX), Math.floor(this.gameY), 60);
                enemy.setCollidable(false);
            }
        }
        this.setCollidable(false);
        audioManager.play('blackhole');
    }

    draw(ctx) {
        if (this._exploding) {
            const cx = this.gameX;
            const cy = this.gameY;

            // Outer circle (purple, pulsing)
            const outerAlpha = this._trans / 255;
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(1, this._holeRadius), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(128, 0, 110, ${outerAlpha})`;
            ctx.fill();
            ctx.restore();

            // Inner circle
            const innerAlpha = (255 - this._trans + 60) / 255;
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, 80, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${innerAlpha})`;
            ctx.fill();
            ctx.restore();

            // Center circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.restore();
            return;
        }

        super.draw(ctx);
    }
}
