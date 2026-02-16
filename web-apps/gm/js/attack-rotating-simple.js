import { AttackNode } from './attack-node.js';
import { gameAssets } from './game-assets.js';
import { audioManager } from './audio-manager.js';
import { getAttackPoints } from './points-lookup.js';
import { SCREEN_HEIGHT } from './game-sprite.js';

export class AttackRotatingSimple extends AttackNode {
    constructor(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, friction, gravity, damage) {
        super(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, damage);

        this.friction = friction;
        this.gravity = gravity;
        this._currentImage = 0;
        this._maxImages = 7; // rotation frames
        this._terminalVelocity = 250;

        this._hitTimer = 999999;
        this._totalHitTime = 0.2;
        this._hitX = 0;
        this._hitY = 0;

        this.animEnabled = false;
        this.setTerminalVelocity(this._terminalVelocity);
        this.animPerSec = 10;
        this.lengthPerFrame = 1.0 / this.animPerSec;
    }

    eventCollided(sprite) {
        if (sprite.type >= 100 && sprite.type <= 500 && sprite.constructor.name !== 'GameSprite') {
            // It's an enemy
            sprite.takeDamage(this.damage);
            audioManager.playHit();
            this.setCollidable(false);
            this.velocityX = -this.velocityX; // bounce

            this._hitX = this.gameX;
            this._hitY = this.gameY + this.height;
            this._hitTimer = 0;

            if (this.player) {
                this.player.givePoints(getAttackPoints(this.type));
                this.player.hitSuccess();
            }
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.doAnimation(deltaTime);
        this.doPhysics(deltaTime);

        // Destroy when hitting floor
        const checkX = Math.floor(this.gameX) + Math.floor(this.width / 2);
        if (checkX >= 0 && checkX < this.floor.length) {
            if (this.gameY > this.floor[checkX]) {
                if (this.player) this.player.destroyAttack(this);
                return;
            }
        } else if (this.gameY >= SCREEN_HEIGHT) {
            if (this.player) this.player.destroyAttack(this);
            return;
        }

        if (this._hitTimer <= this._totalHitTime) {
            this._hitTimer += deltaTime;
        }
    }

    doAnimation(deltaTime) {
        this.animTimer += deltaTime;
        if (this.animTimer >= this.lengthPerFrame) {
            this._currentImage++;
            if (this._currentImage >= this._maxImages) this._currentImage = 0;
            this.animTimer = 0;
        }
    }

    doPhysics(deltaTime) {
        this.fall(this.gravity * deltaTime);
        this.stopHorizontal(this.friction * deltaTime);
    }

    draw(ctx) {
        if (!this.visible) return;

        const img = gameAssets.getImage(this.sheetName);
        if (!img) return;

        const displayX = this.gameX + this.offsetDrawX;
        const displayY = this.gameY + this.offsetDrawY;
        const centerX = displayX + this.width / 2;
        const centerY = displayY + this.height / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        // Rotate based on current animation frame
        const angle = this._currentImage * (2 * Math.PI / this._maxImages);
        ctx.rotate(angle);
        if (this.flipped) ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, this.width, this.height,
            -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        // Draw hit marker
        this.drawHitMarker(ctx);
    }

    drawHitMarker(ctx) {
        if (this._hitTimer <= this._totalHitTime) {
            const hitImg = gameAssets.getImage('hitMarker');
            if (hitImg) {
                ctx.drawImage(hitImg, this._hitX, this._hitY);
            }
        }
    }
}
