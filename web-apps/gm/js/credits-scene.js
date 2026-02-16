import { gameAssets } from './game-assets.js';

export class CreditsScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
    }

    handleTouchDown(points) {}

    handleTouchUp(points) {
        for (const touch of points) {
            const tx = Math.floor(touch.x);
            const ty = Math.floor(touch.y);
            // Back button: (350, 300, 250, 100)
            if (tx >= 350 && tx <= 600 && ty >= 300 && ty <= 400) {
                this.sceneManager.switchScene('mainMenu');
                return;
            }
        }
    }

    update(deltaTime) {}

    draw(ctx) {
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 800, 480);

        ctx.save();

        // Credits text
        ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'left';
        ctx.fillText('Credits:', 0, 55);

        ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
        ctx.fillText('Programming:', 0, 95);

        ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
        ctx.fillText('Cody Rigney', 0, 130);

        ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
        ctx.fillText('Graphics:', 0, 200);

        ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
        ctx.fillText('Sean Coxwell', 0, 245);

        ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
        ctx.fillText('Sound (Attribution):', 300, 95);

        ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
        ctx.fillText('Mike Koenig', 300, 130);
        ctx.fillText('Mark DiAngelo', 300, 165);

        // Sean Coxwell memorial section
        ctx.font = 'bold 16px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Sean Coxwell', 90, 275);

        const photo = gameAssets.getImage('sean-coxwell-small');
        if (photo) {
            ctx.drawImage(photo, 90 - photo.width / 2, 285);
        }

        ctx.font = '12px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText('May 1986 - February 2020', 90, photo ? 285 + photo.height + 14 : 400);

        // Back button
        ctx.fillStyle = 'blue';
        ctx.fillRect(350, 300, 250, 100);

        ctx.font = 'bold 25px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.fillText('Back to Main Menu', 360, 360);

        ctx.restore();
    }
}
