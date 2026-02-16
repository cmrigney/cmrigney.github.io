import { GameSprite, SCREEN_HEIGHT } from './game-sprite.js';
import { Types } from './game-types.js';
import { gameAssets } from './game-assets.js';

export class WaveTicketNode extends GameSprite {
    constructor(screen, x, y) {
        const img = gameAssets.getImage('WaveTicket');
        const w = img ? img.width : 64;
        const h = img ? img.height : 64;
        super('WaveTicket', Types.tWaveTicket, x, y, w, h, 2, 1, 1.0);
        this.gameScreen = screen;
        this.animEnabled = false;
        this._flashTimer = 0;
        this._showLoad = false;
    }

    handleTouches(touches) {
        for (const touch of touches) {
            const tx = touch.x;
            const ty = touch.y;

            if (tx >= this.gameX && tx <= this.gameX + this.width &&
                ty >= this.gameY && ty <= this.gameY + this.height) {
                if (this.gameScreen && this.gameScreen.getPlayer() &&
                    !this.gameScreen.getPlayer().isCrashing()) {
                    this.gameScreen.ticketCollected();
                    this._showLoad = true;
                }
            }
        }
    }

    updateTicket(deltaTime) {
        this._flashTimer += deltaTime;
        if (this._flashTimer >= 0.5) {
            this._flashTimer = 0;
            this.toggleVisibility();
        }
    }

    draw(ctx) {
        super.draw(ctx);

        if (this._showLoad) {
            ctx.save();
            ctx.font = 'bold 22px Helvetica, Arial, sans-serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('Preparing next wave...', 400, 180);
            ctx.restore();
        }
    }
}
