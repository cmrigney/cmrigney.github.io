export class LoadingScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this._progress = 0;
        this._message = 'Initializing...';
        this._bananaAngle = 0;
        this._bounceOffset = 0;
        this._bounceDir = 1;

        this.funMessages = [
            'Peeling bananas...',
            'Waking up the monkeys...',
            'Polishing the castle...',
            'Loading banana cannons...',
            'Charging banana power...',
            'Summoning the guardian...',
            'Preparing defenses...',
            'Training the troops...',
            'Counting bananas...'
        ];
        this._msgIndex = 0;
        this._msgTimer = 0;
    }

    handleTouchDown(points) {}
    handleTouchUp(points) {}

    setProgress(progress, message) {
        this._progress = progress;
        if (message) this._message = message;
    }

    update(deltaTime) {
        this._bananaAngle += deltaTime * 4;
        this._bounceOffset += this._bounceDir * 25 * deltaTime;
        if (this._bounceOffset > 15) this._bounceDir = -1;
        if (this._bounceOffset < -15) this._bounceDir = 1;

        this._msgTimer += deltaTime;
        if (this._msgTimer >= 1.5) {
            this._msgTimer = 0;
            this._msgIndex = (this._msgIndex + 1) % this.funMessages.length;
        }
    }

    draw(ctx) {
        // Background gradient
        ctx.fillStyle = '#332619';
        ctx.fillRect(0, 0, 800, 240);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 240, 800, 240);

        // Title
        ctx.save();
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.fillStyle = '#ffe64d';
        ctx.textAlign = 'center';
        ctx.fillText('Guardian Monkey', 400, 320 + this._bounceOffset);
        ctx.restore();

        // Spinning banana shape
        ctx.save();
        ctx.translate(400, 200);
        ctx.rotate(this._bananaAngle);
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.quadraticCurveTo(-8, 0, 10, 30);
        ctx.quadraticCurveTo(5, 0, 0, -30);
        ctx.fillStyle = '#ffe633';
        ctx.fill();
        ctx.strokeStyle = '#e6b300';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Fun message
        ctx.save();
        ctx.font = '28px Arial, sans-serif';
        ctx.fillStyle = '#ffd966';
        ctx.textAlign = 'center';
        ctx.fillText(this.funMessages[this._msgIndex], 400, 130);
        ctx.restore();

        // Progress bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(200, 70, 400, 20);

        // Progress bar fill
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(200, 70, 400 * this._progress, 20);

        // Tech info
        ctx.save();
        ctx.font = '18px Courier, monospace';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText(this._message, 400, 50);
        ctx.restore();
    }
}
