import { EnemyNode } from './enemy-node.js';
import { EnemyLookUp } from './enemy-lookup.js';
import { lookUpEnemyFrames } from './points-lookup.js';
import { Types, States } from './game-types.js';
import { audioManager } from './audio-manager.js';

export class EnemyThrowerNode extends EnemyNode {
    constructor(screen, sheetName, type, x, y, width, height, xBounds, yBounds, scale,
                health, attackDamage, walkSpeed, floor, dir) {
        super(screen, sheetName, type, x, y, width, height, xBounds, yBounds, scale,
              health, attackDamage, walkSpeed, floor, dir);
        this._timeToReachPlayer = 2.3;
        this._throwTime = 5;
        this._throwTimer = 0;
        this._throwing = false;
    }

    updateEnemy(deltaTime) {
        super.updateEnemy(deltaTime);

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

                audioManager.play('throw');

                this.resetAnim();
                this.setAnimState(States.walking);
                this.setNumberFrames(lookUpEnemyFrames(this.type, this.animState));
                this._throwing = false;
                this._throwTimer = 0;

                // Create throwable
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

                if (newAttack.setParent) {
                    newAttack.setParent(this);
                }

                // Calculate velocity toward player
                const player = this.screen ? this.screen.getPlayer() : null;
                if (player) {
                    const diffX = (player.gameX + player.width / 2) - this.gameX;
                    const diffY = (player.gameY + player.height / 2) - this.gameY;

                    let mvX, mvY;
                    if (diffX * diffX + diffY * diffY <= 125 * 125) {
                        mvX = diffX * 1.5;
                        mvY = diffY * 1.5;
                    } else {
                        mvX = player.velocityX * this._timeToReachPlayer + diffX;
                        mvY = player.velocityY * this._timeToReachPlayer + diffY;
                        mvX /= this._timeToReachPlayer;
                        mvY /= this._timeToReachPlayer;
                    }
                    newAttack.setVelocity(mvX, mvY);
                }

                if (this.screen) this.screen.addEnemy(newAttack);
            }
        }
    }
}
