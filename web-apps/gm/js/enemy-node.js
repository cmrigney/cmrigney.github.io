import { GameSprite } from './game-sprite.js';
import { Types, States } from './game-types.js';
import { getEnemyPoints, lookUpEnemyFrames } from './points-lookup.js';
import { gameAssets } from './game-assets.js';

export class EnemyNode extends GameSprite {
    static LEFT = 1;
    static RIGHT = 2;

    constructor(screen, sheetName, type, x, y, width, height, xBounds, yBounds, scale,
                health, attackDamage, walkSpeed, floor, dir) {
        super(sheetName, type, x, y, width, height, xBounds, yBounds, scale);

        this.screen = screen;
        this.health = health;
        this.attackDamage = attackDamage;
        this.walkSpeed = walkSpeed;
        this.floorCollision = floor;
        this.isDying = false;
        this.canAttackCastle = true;
        this.direction = dir;

        this.castle = null;
        this.attackCastle = false;
        this.attackProtector = false;
        this.protectorMonkey = null;

        this._ignoreFloor = false;
        this._delayTimer = 0;
        this._delayedDamage = false;
        this._damageFromDelay = 0;
        this._dyingTimer = 0;
        this._frozen = false;
        this._frozenTimer = 0;
        this._timeToBeFrozen = 3;
        this.isPulling = false;

        this.calcLengthPerFrame(walkSpeed / 4);

        if (dir === EnemyNode.RIGHT) {
            this.velocityX = walkSpeed;
            this.flipped = false;
        } else {
            this.velocityX = -walkSpeed;
            this.flipped = true;
        }

        this.setAnimState(States.walking);
        this.setNumberFrames(lookUpEnemyFrames(type, this.animState));
    }

    eventCollided(sprite) {
        if (sprite.type === Types.pCastle && !this.attackCastle && !this._frozen) {
            this.setVelocity(0, 0);
            this.resetAnim();
            this.setAnimState(States.attacking);
            this.setNumberFrames(lookUpEnemyFrames(this.type, this.animState));
            this.calcLengthPerFrame(5);
            this.castle = sprite;
            this.attackCastle = true;
        } else if (sprite.type === Types.pPlayer) {
            sprite.crash();
            this.takeDamage(40);
        } else if (sprite.type === Types.aProtector && !this._frozen && !this.attackProtector) {
            this.setVelocity(0, 0);
            this.resetAnim();
            this.setAnimState(States.attacking);
            this.setNumberFrames(lookUpEnemyFrames(this.type, this.animState));
            this.calcLengthPerFrame(5);
            this.protectorMonkey = sprite;
            this.attackProtector = true;
            this.protectorMonkey.eventCollided(this);
        }
    }

    update(deltaTime) {
        this.updateEnemy(deltaTime);
    }

    updateEnemy(deltaTime) {
        // Dying
        if (this.isDying) {
            this._dyingTimer += deltaTime;
            if (this._dyingTimer >= 1) {
                if (this.screen) this.screen.notifyEnemyDead(this);
                return;
            }
            return;
        }

        // Delayed damage
        if (this._delayedDamage) {
            this._delayTimer -= deltaTime;
            if (this._delayTimer <= 0) {
                this.takeDamage(this._damageFromDelay);
                this._damageFromDelay = 0;
                this._delayedDamage = false;
                this._delayTimer = 0;
            }
        }

        // Attacking castle
        if (this.attackCastle) {
            if (this.loopedOnce) {
                this.resetAnim();
                this.setAnimState(States.attacking);
                if (this.castle) this.castle.takeDamage(this.attackDamage);
            }
        }

        // Attacking protector
        if (this.attackProtector) {
            if (this.protectorMonkey) {
                if (this.protectorMonkey.dead) {
                    this.attackProtector = false;
                    this.protectorMonkey = null;
                    this.resumeWalking();
                } else if (this.loopedOnce) {
                    this.protectorMonkey.eventCollided(this);
                    this.resetAnim();
                    this.setAnimState(States.attacking);
                    if (this.protectorMonkey.takeDamage(this.attackDamage)) {
                        this.attackProtector = false;
                        this.protectorMonkey = null;
                        this.resumeWalking();
                    }
                }
            }
        }

        // Frozen
        if (this._frozen) {
            this._frozenTimer += deltaTime;
            if (this._frozenTimer >= this._timeToBeFrozen) {
                this._frozen = false;
                this.resumeWalking();
                this.animEnabled = true;
            }
        }

        // Floor collision
        if (!this._ignoreFloor) {
            const checkX = Math.floor(this.gameX) + Math.floor(this.width / 2);
            if (checkX >= 0 && checkX < this.floorCollision.length) {
                this.setY(this.floorCollision[checkX] - this.height);
            } else if (checkX < 0) {
                this.setY(this.floorCollision[0] - this.height);
            } else {
                this.setY(this.floorCollision[799] - this.height);
            }
        }
    }

    resumeWalking() {
        if (this.direction === EnemyNode.RIGHT) {
            this.velocityX = this.walkSpeed;
            this.flipped = false;
        } else {
            this.velocityX = -this.walkSpeed;
            this.flipped = true;
        }
        this.resetAnim();
        this.setAnimState(States.walking);
        this.setNumberFrames(lookUpEnemyFrames(this.type, this.animState));
    }

    takeDamage(dam) {
        if (this._frozen) {
            this.die();
            return;
        }
        this.health -= dam;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.resetAnim();
        this.setAnimState(States.dying);
        this.setNumberFrames(1);
        this.setCollidable(false);
        this.setVelocity(0, 0);
        if (this.screen) {
            const player = this.screen.getPlayer();
            if (player) player.givePoints(getEnemyPoints(this.type));
        }
        this.isDying = true;
    }

    gravitateToward(toX, toY, mag) {
        this.isPulling = true;
        const dx = toX - this.gameX;
        const dy = toY - this.gameY;
        const m = Math.sqrt(dx * dx + dy * dy);
        if (m > 0) {
            this.velocityX = (dx / m) * mag;
            this.velocityY = (dy / m) * mag;
        }
        this.attackCastle = false;
        this.attackProtector = false;
    }

    gravitateAway(fromX, fromY, mag) {
        const dx = this.gameX - fromX;
        const dy = this.gameY - fromY;
        const m = Math.sqrt(dx * dx + dy * dy);
        if (m > 0) {
            this.velocityX = (dx / m) * mag;
            this.velocityY = (dy / m) * mag;
        }
    }

    setIgnoreFloor(value) {
        this._ignoreFloor = value;
    }

    takeDelayedDamage(dam, tim) {
        this._delayedDamage = true;
        this._delayTimer = tim;
        this._damageFromDelay += dam;
    }

    freeze(time) {
        this._frozen = true;
        this._timeToBeFrozen = time;
        this._frozenTimer = 0;
        this.animEnabled = false;
        this.setVelocity(0, 0);
    }

    draw(ctx) {
        // Draw ice block behind enemy if frozen
        if (this._frozen && this.visible) {
            const iceImg = gameAssets.getImage('iceBlock');
            if (iceImg) {
                const displayX = this.gameX + this.offsetDrawX;
                const displayY = this.gameY + this.offsetDrawY;
                ctx.drawImage(iceImg,
                    displayX + this.width / 2 - iceImg.width / 2,
                    displayY + this.height / 2 - iceImg.height / 2);
            }
        }

        super.draw(ctx);
    }
}
