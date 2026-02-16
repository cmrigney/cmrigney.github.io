import { gameAssets } from './game-assets.js';
import { gameSettings } from './game-settings.js';

export class MainMenuScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this._touchedDown = false;
    }

    handleTouchDown(points) {
        this._touchedDown = true;
    }

    handleTouchUp(points) {
        if (!this._touchedDown) return;

        for (const touch of points) {
            const tx = Math.floor(touch.x);
            const ty = Math.floor(touch.y);

            // Play button: (240, 130, 320, 84)
            if (tx >= 240 && tx <= 560 && ty >= 130 && ty <= 214) {
                this.sceneManager.switchScene('game');
                return;
            }
            // How to Play: (298, 236, 216, 53)
            else if (tx >= 298 && tx <= 514 && ty >= 236 && ty <= 289) {
                this.sceneManager.switchScene('howToPlay');
                return;
            }
            // High Scores: (298, 312, 216, 53)
            else if (tx >= 298 && tx <= 514 && ty >= 312 && ty <= 365) {
                this.sceneManager.switchScene('highScore');
                return;
            }
            // Sound toggle: (415, 400, 64, 64)
            else if (tx >= 415 && tx <= 479 && ty >= 400 && ty <= 464) {
                gameSettings.soundEnabled = !gameSettings.soundEnabled;
                gameSettings.save();
                return;
            }
            // Credits: (44, 238, 114, 98)
            else if (tx >= 44 && tx <= 158 && ty >= 238 && ty <= 336) {
                this.sceneManager.switchScene('credits');
                return;
            }
        }
    }

    update(deltaTime) {
        // No updates needed
    }

    draw(ctx) {
        const bg = gameAssets.getImage('menuBG');
        if (bg) {
            ctx.drawImage(bg, 0, 0, 800, 480);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 800, 480);
        }

        // Sound icon
        const soundOn = gameAssets.getImage('SOUNDON');
        if (soundOn) {
            ctx.drawImage(soundOn, 415, 400);
        }

        if (!gameSettings.soundEnabled) {
            const soundOff = gameAssets.getImage('SOUNDOFF');
            if (soundOff) {
                ctx.drawImage(soundOff, 415, 400);
            }
        }
    }
}
