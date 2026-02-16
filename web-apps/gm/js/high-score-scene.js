import { gameAssets } from './game-assets.js';
import { gameSettings } from './game-settings.js';

export class HighScoreScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.localScores = [];

        gameSettings.load();
        for (let i = 0; i < gameSettings.highScores.length; i++) {
            if (gameSettings.names[i]) {
                this.localScores.push(`${gameSettings.names[i]} - ${gameSettings.highScores[i]} - Wave ${gameSettings.highWaves[i]}`);
            } else {
                this.localScores.push('');
            }
        }
    }

    handleTouchDown(points) {}

    handleTouchUp(points) {
        for (const touch of points) {
            const tx = Math.floor(touch.x);
            const ty = Math.floor(touch.y);
            // Back button: (347, 304, 264, 92)
            if (tx >= 347 && tx <= 611 && ty >= 304 && ty <= 396) {
                this.sceneManager.switchScene('mainMenu');
                return;
            }
        }
    }

    update(deltaTime) {}

    draw(ctx) {
        const bg = gameAssets.getImage('HighScoremenuFull');
        if (bg) {
            ctx.drawImage(bg, 0, 0, 800, 480);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 800, 480);
        }

        // Header
        ctx.save();
        ctx.font = 'bold 19px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText('Overall', 5, 116);

        // Scores
        ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
        for (let i = 0; i < this.localScores.length; i++) {
            if (this.localScores[i]) {
                const yPos = 127 + i * 17;
                ctx.fillText(this.localScores[i], 5, yPos);
            }
        }

        // Online message
        ctx.fillText('Online scores not available', 200, 127);
        ctx.restore();
    }
}
