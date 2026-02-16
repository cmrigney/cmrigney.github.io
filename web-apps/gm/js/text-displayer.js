export class TextDisplayer {
    constructor(speed, dist, x, y) {
        this.speed = speed;
        this.dist = dist;
        this.x = x;
        this.y = y;
        this.data = [];
        this._toBeAdded = [];
    }

    addNew(str) {
        if (this.data.length > 0 && this.data[this.data.length - 1].move >= 10) {
            this.data.push({ text: str, move: 0 });
        } else if (this.data.length === 0) {
            this.data.push({ text: str, move: 0 });
        } else {
            this._toBeAdded.push({ text: str, move: 0 });
        }
    }

    update(deltaTime) {
        if (this._toBeAdded.length > 0) {
            if (this.data.length > 0 && this.data[this.data.length - 1].move >= 10) {
                this.data.push(this._toBeAdded.shift());
            } else if (this.data.length === 0) {
                this.data.push(this._toBeAdded.shift());
            }
        }

        let i = 0;
        while (i < this.data.length) {
            this.data[i].move += deltaTime * this.speed;
            if (this.data[i].move >= this.dist) {
                this.data.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.font = 'bold 16px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'left';
        for (const td of this.data) {
            ctx.fillText(td.text, this.x, this.y + td.move);
        }
        ctx.restore();
    }
}
