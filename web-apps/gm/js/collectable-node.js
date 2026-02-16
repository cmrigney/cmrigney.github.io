import { GameSprite } from './game-sprite.js';
import { Types } from './game-types.js';
import { gameAssets } from './game-assets.js';

export class CollectableNode extends GameSprite {
    constructor(screen, sheetName, x, y, width, height) {
        super(sheetName, Types.pCollectable, x, y, width, height, 1, 1, 1.0);
        this.screen = screen;
        this.animEnabled = false;
        this.setVelocity(0, -30);
    }

    update(deltaTime) {
        this.wrapSprite();
        if (this.gameY + this.height < 0) {
            if (this.screen) this.screen.removeCollectable(this);
        }
    }
}

export class CollectableAttack extends CollectableNode {
    constructor(screen, type, x, y) {
        const imgName = gameAssets.resolveAttackBoxImageName(type);
        const img = gameAssets.getImage(imgName);
        const w = img ? img.width : 64;
        const h = img ? img.height : 64;
        super(screen, imgName, x, y, w, h);
        this._attackToGive = type;
    }

    eventCollided(sprite) {
        if (sprite.type === Types.pPlayer) {
            if (sprite.giveAttack(this._attackToGive)) {
                if (this.screen) this.screen.removeCollectable(this);
            } else {
                this.setCollidable(false);
            }
        }
    }

    static getRandomCollectable(sub) {
        const minType = 1002;
        const maxType = 1007 - sub;
        const range = maxType - minType + 1;
        return minType + Math.floor(Math.random() * range);
    }

    static getRandomCollectableStrong() {
        const minType = 1004;
        const maxType = 1006;
        const range = maxType - minType + 1;
        return minType + Math.floor(Math.random() * range);
    }

    static getRandomCollectableWeak() {
        const minType = 1002;
        const maxType = 1003;
        const range = maxType - minType + 1;
        return minType + Math.floor(Math.random() * range);
    }
}

export class CollectableBoost extends CollectableNode {
    constructor(screen, x, y) {
        const img = gameAssets.getImage('bananaAttackBoost');
        const w = img ? img.width : 32;
        const h = img ? img.height : 32;
        super(screen, 'bananaAttackBoost', x, y, w, h);
    }

    eventCollided(sprite) {
        if (sprite.type === Types.pPlayer) {
            sprite.giveAttackBoost(10);
            if (this.screen) this.screen.removeCollectable(this);
        }
    }
}
