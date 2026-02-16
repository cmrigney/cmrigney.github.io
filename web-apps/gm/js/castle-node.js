import { GameSprite, SCREEN_HEIGHT } from './game-sprite.js';
import { Types } from './game-types.js';
import { gameAssets } from './game-assets.js';

export class CastleNode extends GameSprite {
    constructor(screen, x, y, width, height, health) {
        super('castle', Types.pCastle, x, y, width, height, 1, 1, 0.65);
        this.screen = screen;
        this.health = health;
        this.defaultHealth = health;
        this._calledOver = false;
        this.animEnabled = false;
    }

    eventCollided(sprite) {
        if (sprite.type === Types.pPlayer) {
            sprite.crash();
        }
    }

    update(deltaTime) {
        // Nothing
    }

    takeDamage(dam) {
        this.health -= dam;
        if (this.health <= 0 && !this._calledOver) {
            this.health = 0;
            this._calledOver = true;
            if (this.screen) this.screen.triggerGameOver('Your kingdom has been destroyed.');
        }
    }

    draw(ctx) {
        super.draw(ctx);

        // Health bar
        const displayX = this.gameX + this.offsetDrawX;
        const displayY = this.gameY + this.offsetDrawY;
        const barY = displayY - 12;

        // Background (red)
        ctx.fillStyle = 'red';
        ctx.fillRect(displayX, barY, this.width, 10);

        // Fill (green)
        const ratio = this.health / this.defaultHealth;
        ctx.fillStyle = 'green';
        ctx.fillRect(displayX + 2, barY + 1, (this.width - 4) * ratio, 8);
    }
}
