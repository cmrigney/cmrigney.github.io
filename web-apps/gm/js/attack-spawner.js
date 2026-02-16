import { AttackNode } from './attack-node.js';
import { Types } from './game-types.js';

export class AttackSpawner extends AttackNode {
    constructor(thisType, spawnType, interval, life, player, floor) {
        super(null, thisType, player.getX(), player.getY(), 1, 1, 1, 1, 1, floor, player, 0);
        this._typeToSpawn = spawnType;
        this._interval = interval;
        this._life = life;
        this._counter = 0;
        this.setCollidable(false);
        this.visible = false;
        player.hitSuccess();
    }

    update(deltaTime) {
        if (!this.player) return;
        this.setX(this.player.gameX);
        this.setY(this.player.gameY);

        if (this.player.isCrashing()) {
            this.player.destroyAttack(this);
            return;
        }

        this._counter += deltaTime;
        if (this._counter >= this._interval) {
            this._counter = 0;
            this._life--;
            if (this.player.useAttack(this._typeToSpawn)) {
                this.player.decThrown();
            }
            if (this._life <= 0) {
                this.player.destroyAttack(this);
            }
        }
    }

    eventCollided(sprite) {
        // Do nothing
    }

    draw(ctx) {
        // Invisible
    }
}
