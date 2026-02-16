import { GameSprite } from './game-sprite.js';
import { Types, States } from './game-types.js';
import { getAttackPoints } from './points-lookup.js';
import { EnemyWaveAlgorithm } from './enemy-wave-algorithm.js';

export class ProtectorMonkeyNode extends GameSprite {
    constructor(screen, x, y, floor, damage, health) {
        super('protectMonkeyAnimations', Types.aProtector, x, y, 58, 100, 1, 2, 1.0);
        this.screen = screen;
        this._damagePower = damage;
        this.health = health;
        this.defaultHealth = health;
        this._floor = floor;
        this._enemyTargeted = false;
        this._target = null;
        this.dead = false;
        this._inFalling = true;
        this._yLand = 0;

        this.setNumberFrames(2);
        this.setAnimState(States.standing);
        this.calcLengthPerFrame(8);
    }

    eventCollided(sprite) {
        if (this._inFalling) {
            if (sprite.type >= 100 && sprite.type < 200) {
                sprite.takeDamage(999999999);
            } else {
                this.addIgnoreCollision(sprite);
            }
        } else {
            if (sprite.type >= 100 && sprite.type < 200) {
                if (!this._enemyTargeted) {
                    if (!sprite.canAttackCastle) {
                        this.addIgnoreCollision(sprite);
                        return;
                    }
                    this._target = sprite;
                    this._enemyTargeted = true;
                    this.resetAnim();
                    this.setAnimState(States.attacking - 1);
                    this.setNumberFrames(8);
                    sprite.eventCollided(this);
                }
            } else {
                this.addIgnoreCollision(sprite);
            }
        }
    }

    updateProtector(deltaTime) {
        if (this._inFalling) {
            if (this.gameY >= this._yLand) {
                this._inFalling = false;
                this.restoreLand();
                this.setVelocity(0, 0);
            }
            return;
        }

        if (this._enemyTargeted) {
            if (!this._target || !this._target.isCollidable() || this._target.isDying) {
                this.returnToStand();
                return;
            }
            if (this.loopedOnce) {
                this._target.takeDamage(this._damagePower);
                if (this.screen) {
                    const player = this.screen.getPlayer();
                    if (player) player.givePoints(getAttackPoints(Types.aBananaBomb));
                }
                this.resetAnim();
                this.setAnimState(States.attacking - 1);
            }
        }
    }

    upgrade(factor) {
        EnemyWaveAlgorithm.runForProtector(factor);
        this.health = Math.floor(this.health * EnemyWaveAlgorithm.healthFactorForApe);
        this.defaultHealth = Math.floor(this.defaultHealth * EnemyWaveAlgorithm.healthFactorForApe);
        this._damagePower = Math.floor(this._damagePower * EnemyWaveAlgorithm.attackDamageFactorForApe);
    }

    returnToStand() {
        this._enemyTargeted = false;
        this._target = null;
        this.resetAnim();
        this.setAnimState(States.standing);
        this.setNumberFrames(2);
    }

    cacheLand() {
        this._yLand = Math.floor(this.gameY);
    }

    restoreLand() {
        this.gameY = this._yLand;
    }

    takeDamage(dam) {
        this.health -= dam;
        if (this.health <= 0) {
            if (this.screen) this.screen.notifyDeadProtector();
            this.dead = true;
            return true;
        }
        return false;
    }

    setDirection(facingRight) {
        this.flipped = facingRight;
    }

    draw(ctx) {
        super.draw(ctx);

        // Health bar
        if (this.visible && !this.dead) {
            const displayX = this.gameX + this.offsetDrawX;
            const displayY = this.gameY + this.offsetDrawY;
            const barY = displayY - 12;
            const barW = 48;

            ctx.fillStyle = 'red';
            ctx.fillRect(displayX + this.width / 2 - barW / 2, barY, barW, 10);

            const ratio = this.health / this.defaultHealth;
            ctx.fillStyle = 'green';
            ctx.fillRect(displayX + this.width / 2 - barW / 2 + 2, barY + 1, (barW - 4) * ratio, 8);
        }
    }
}
