import { AttackNode } from './attack-node.js';
import { getAttackPoints } from './points-lookup.js';
import { gameAssets } from './game-assets.js';

export class AttackSmallExplosion extends AttackNode {
    constructor(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, damage) {
        super(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, damage);
        this._expTimer = 0;
        this._totalTime = 0.2;
    }

    eventCollided(sprite) {
        if (sprite.type >= 100 && sprite.type <= 500) {
            sprite.takeDamage(this.damage);
            if (this.player) {
                this.player.givePoints(getAttackPoints(this.type));
                if (!this.ignoreAcc) {
                    this.player.hitSuccess();
                }
            }
            this.addIgnoreCollision(sprite);
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.loopedOnce) {
            if (this.player) this.player.destroyAttack(this);
            return;
        }
        if (this._expTimer <= this._totalTime) {
            this._expTimer += deltaTime;
        } else {
            if (this.isCollidable()) {
                this.setCollidable(false);
            }
        }
    }

    draw(ctx) {
        if (!this.visible) return;
        const img = gameAssets.getImage(this.sheetName);
        if (!img) return;

        // Explosion sprite sheet: 23 frames, 5 wide, 64px each
        let srcX = this.animFrame * this.width;
        let srcY = this.animState * this.height;
        if (this.continuous && img.width > 0) {
            srcY += Math.floor(srcX / img.width) * this.height;
            srcX = srcX % img.width;
        }

        const displayX = this.gameX + this.offsetDrawX;
        const displayY = this.gameY + this.offsetDrawY;

        gameAssets.drawFrameFromImage(ctx, img, srcX, srcY, this.width, this.height,
            displayX, displayY, this.width, this.height, this.flipped);
    }
}
