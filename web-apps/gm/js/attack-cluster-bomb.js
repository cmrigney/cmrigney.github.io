import { AttackRotatingSimple } from './attack-rotating-simple.js';
import { getAttackPoints } from './points-lookup.js';
import { Types } from './game-types.js';

export class AttackClusterBomb extends AttackRotatingSimple {
    static NUM_BOMBS = 6;
    static FIRE_OFFSETS = [-90, -60, -20, 20, 60, 90];

    constructor(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, friction, gravity, damage) {
        super(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, friction, gravity, damage);
        this._timer = 1.0;
        this._dispersed = false;

        if (player) {
            player.givePoints(getAttackPoints(type));
        }
    }

    eventCollided(sprite) {
        if (sprite.type >= 100 && sprite.type <= 500 && !this._dispersed) {
            this.disperseBombs();
            if (this.player) this.player.destroyAttack(this);
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        this._timer -= deltaTime;
        if (this._timer <= 0 && !this._dispersed) {
            this.disperseBombs();
            if (this.player) this.player.destroyAttack(this);
        }
    }

    async disperseBombs() {
        this._dispersed = true;
        if (!this.player) return;
        const { AttackLookUp } = await import('./attack-lookup.js');
        for (let i = 0; i < AttackClusterBomb.NUM_BOMBS; i++) {
            const bomb = AttackLookUp.createAttack(Types.aBananaBomb, this.player, this.floor);
            if (bomb) {
                bomb.setX(this.gameX);
                bomb.setY(this.gameY);
                bomb.setVelocity(this.velocityX + AttackClusterBomb.FIRE_OFFSETS[i], this.velocityY);
                this.player.addAttack(bomb);
            }
        }
    }
}
