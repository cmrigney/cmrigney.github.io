import { gameAssets } from './game-assets.js';

export class MemorialScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this._timer = 0;
    }

    handleTouchDown(points) {}
    handleTouchUp(points) {}

    update(deltaTime) {
        this._timer += deltaTime;
        if (this._timer >= 5.0) {
            this.sceneManager.switchScene('mainMenu');
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 800, 480);

        const img = gameAssets.getImage('sean-coxwell-memorial');
        if (img) {
            ctx.drawImage(img, 0, 0, 800, 480);
        }
    }
}
