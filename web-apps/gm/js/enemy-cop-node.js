import { EnemyNode } from './enemy-node.js';
import { EnemyLookUp } from './enemy-lookup.js';
import { lookUpEnemyFrames } from './points-lookup.js';
import { Types, States } from './game-types.js';
import { SCREEN_WIDTH } from './game-sprite.js';
import { audioManager } from './audio-manager.js';

export class EnemyCopNode extends EnemyNode {
    constructor(screen, sheetName, type, x, y, width, height, xBounds, yBounds, scale,
                health, attackDamage, walkSpeed, floor, dir, shootSpeed) {
        super(screen, sheetName, type, x, y, width, height, xBounds, yBounds, scale,
              health, attackDamage, walkSpeed, floor, dir);
        this._shootSpeed = shootSpeed;
        this._throwTime = 5;
        this._throwTimer = 0;
        this._throwing = false;
        this._foundCastle = false;
        this.canAttackCastle = false;
    }

    eventCollided(sprite) {
        if (sprite.type === Types.pCastle && !this.attackCastle) {
            // Bounce off castle
            if (this.direction === EnemyNode.RIGHT) {
                this.direction = EnemyNode.LEFT;
                this.flipped = !this.flipped;
                this.velocityX = -this.velocityX;
            } else {
                this.direction = EnemyNode.RIGHT;
                this.flipped = !this.flipped;
                this.velocityX = -this.velocityX;
            }
            this._foundCastle = true;
        } else if (sprite.type === Types.pPlayer) {
            sprite.crash();
            this.takeDamage(40);
        } else if (sprite.type === Types.aProtector) {
            this.addIgnoreCollision(sprite);
        }
    }

    updateEnemy(deltaTime) {
        super.updateEnemy(deltaTime);

        // Bounce off screen edges
        if (this.gameX + this.width >= SCREEN_WIDTH && this._foundCastle) {
            this.direction = EnemyNode.LEFT;
            this.flipped = !this.flipped;
            this.velocityX = -Math.abs(this.velocityX);
        } else if (this.gameX <= 0 && this._foundCastle) {
            this.direction = EnemyNode.RIGHT;
            this.flipped = !this.flipped;
            this.velocityX = Math.abs(this.velocityX);
        }

        if (!this.isCollidable() || this.isDying || this.attackCastle) return;

        if (!this._throwing) {
            this._throwTimer += deltaTime;
            if (this._throwTimer >= this._throwTime) {
                this.setVelocity(0, 0);
                this.resetAnim();
                this.setAnimState(States.attacking);
                this.setNumberFrames(lookUpEnemyFrames(this.type, this.animState));
                this._throwing = true;
            }
        } else {
            if (this.loopedOnce) {
                if (this.direction === EnemyNode.RIGHT) {
                    this.velocityX = this.walkSpeed;
                } else {
                    this.velocityX = -this.walkSpeed;
                }

                audioManager.play('gunfire');

                this.resetAnim();
                this.setAnimState(States.walking);
                this.setNumberFrames(lookUpEnemyFrames(this.type, this.animState));
                this._throwing = false;
                this._throwTimer = 0;

                const throwType = Types.resolveThrowsType(this.type);
                EnemyLookUp.resolve(throwType, this.floorCollision, 0);

                const newAttack = EnemyLookUp.createEnemy(
                    this.screen, EnemyLookUp.resolvedSheetName,
                    throwType, Math.floor(this.gameX) + Math.floor(this.width / 2),
                    Math.floor(this.gameY) - 20,
                    EnemyLookUp.resolvedWidth, EnemyLookUp.resolvedHeight,
                    EnemyLookUp.resolvedXBounds, EnemyLookUp.resolvedYBounds,
                    EnemyLookUp.resolvedBoundsScale, 1, 99999,
                    this.walkSpeed, this.floorCollision, 0
                );

                // Shoot straight up
                newAttack.setVelocity(0, -this._shootSpeed);
                if (this.screen) this.screen.addEnemy(newAttack);
            }
        }
    }
}
