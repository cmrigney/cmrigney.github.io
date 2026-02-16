import { GameSprite } from './game-sprite.js';

export class AttackNode extends GameSprite {
    constructor(sheetName, type, x, y, width, height, xBounds, yBounds, scale, floor, player, damage) {
        super(sheetName, type, x, y, width, height, xBounds, yBounds, scale);
        this.damage = damage;
        this.floor = floor;
        this.player = player;
        this.ignoreAcc = false;
    }

    update(deltaTime) {
        this.wrapSprite();
    }

    boostDamage(amt) {
        this.damage += amt;
    }

    setIgnoreAcc(a) {
        this.ignoreAcc = a;
    }
}
