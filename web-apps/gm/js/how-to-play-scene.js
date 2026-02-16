import { gameAssets } from './game-assets.js';

export class HowToPlayScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
    }

    handleTouchDown(points) {}

    handleTouchUp(points) {
        this.sceneManager.switchScene('mainMenu');
    }

    update(deltaTime) {}

    draw(ctx) {
        const bg = gameAssets.getImage('howToPlay');
        if (bg) {
            ctx.drawImage(bg, 0, 0, 800, 480);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 800, 480);
        }
    }
}
