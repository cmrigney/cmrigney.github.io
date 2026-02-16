import { AttackRotatingSimple } from './attack-rotating-simple.js';
import { getAttackPoints } from './points-lookup.js';
import { audioManager } from './audio-manager.js';
import { SCREEN_HEIGHT } from './game-sprite.js';

export class AttackIce extends AttackRotatingSimple {
    constructor(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, friction, gravity, damage) {
        super(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, friction, gravity, damage);
        this._exploding = false;
        this._alpha = 255;
        this._changePerSec = 255;
    }

    eventCollided(sprite) {
        if (sprite.type >= 100 && sprite.type <= 500) {
            this.doExplode();
        }
    }

    update(deltaTime) {
        if (this._exploding) {
            this._alpha -= this._changePerSec * deltaTime;
            if (this._alpha <= 0) {
                this._alpha = 0;
                if (this.player) this.player.destroyAttack(this);
                return;
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
        audioManager.play('iceshatter');
        if (this.player) {
            this.player.hitSuccess();
            this.player.givePoints(getAttackPoints(this.type));

            // Freeze all enemies
            const enemies = this.player.screen ? this.player.screen.getEnemies() : [];
            for (const enemy of enemies) {
                if (!enemy) continue;
                enemy.takeDamage(this.damage);
                enemy.freeze(10);
            }
        }
        this._exploding = true;
        this.setVelocity(0, 0);
        this.setCollidable(false);
    }

    drawOverlay(ctx) {
        if (this._exploding && this._alpha > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(200, 200, 255, ${this._alpha / 255})`;
            ctx.fillRect(0, 0, 800, 480);
            ctx.restore();
        }
    }

    draw(ctx) {
        if (this._exploding) return;
        super.draw(ctx);
    }
}
