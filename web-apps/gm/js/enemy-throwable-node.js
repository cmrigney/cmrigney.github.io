import { EnemyNode } from './enemy-node.js';
import { lookUpEnemyFrames } from './points-lookup.js';
import { Types, States } from './game-types.js';
import { audioManager } from './audio-manager.js';

export class EnemyThrowableNode extends EnemyNode {
    constructor(screen, sheetName, type, x, y, width, height, xBounds, yBounds, scale,
                health, attackDamage, walkSpeed, floor, dir) {
        super(screen, sheetName, type, x, y, width, height, xBounds, yBounds, scale,
              health, attackDamage, walkSpeed, floor, dir);
        this._parentEnemy = null;
        this.setIgnoreFloor(true);
        this.resetAnim();
        this.setNumberFrames(lookUpEnemyFrames(type, States.standing));
        this.setAnimState(States.standing);
    }

    setParent(parent) {
        this._parentEnemy = parent;
    }

    eventCollided(sprite) {
        if (sprite.type === Types.pPlayer) {
            audioManager.playHit();
            sprite.crash();
            if (this.screen) this.screen.notifyEnemyDead(this);
        } else if (sprite.type === Types.pCastle) {
            if (this.screen) this.screen.notifyEnemyDead(this);
        } else {
            this.addIgnoreCollision(sprite);
        }
    }

    updateEnemy(deltaTime) {
        super.updateEnemy(deltaTime);

        if (this._parentEnemy && this._parentEnemy.isDying) {
            this._parentEnemy = null;
            if (this.screen) this.screen.notifyEnemyDead(this);
            return;
        }

        // Destroy when out of bounds
        if (this.gameX + this.width < 0 || this.gameX > 800 ||
            this.gameY + this.height < 0 || this.gameY > 480) {
            if (this.screen) this.screen.notifyEnemyDead(this);
        }
    }
}
