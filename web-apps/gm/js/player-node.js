import { GameSprite, SCREEN_HEIGHT } from './game-sprite.js';
import { Types, States } from './game-types.js';
import { gameAssets } from './game-assets.js';
import { AttackLookUp } from './attack-lookup.js';
import { ProtectorMonkeyNode } from './protector-monkey.js';
import { audioManager } from './audio-manager.js';
import { TextDisplayer } from './text-displayer.js';

export class PlayerNode extends GameSprite {
    static DEFAULT_FLY_SPEED = 100;
    static RESPAWN_INV_TIME = 1.5;
    static MAX_ATTACKS = 30;

    constructor(screen, x, y, floor, lives) {
        super('monkeyAnimations', Types.pPlayer, x, y, 64, 64, 1, 1, 0.8);

        this.screen = screen;
        this.floor = floor;
        this.lives = lives;
        this.attacks = new Array(PlayerNode.MAX_ATTACKS).fill(null);
        this.textDisplayer = new TextDisplayer(30, 15, 570, 40);

        this._isInvincible = false;
        this._invTime = 0;
        this._visTimer = 0;

        this._flyToX = 0;
        this._flyToY = 0;
        this._flySpeed = PlayerNode.DEFAULT_FLY_SPEED;

        this._ignoreInputFlag = false;
        this._disableInputFlag = false;
        this._crashing = false;
        this._attacking = false;

        this.attackBox = null;
        this._score = 0;

        this._attackBoost = 0;
        this._attackBoostMessage = false;
        this._attackBoostMsgTimer = 3;

        this._thrownAttacks = 0;
        this._hitAttacks = 0;

        this.setNumberFrames(gameAssets.playerFrames);
        this.calcLengthPerFrame(8);
        this.reset(x, y);
    }

    reset(x, y) {
        this.setAnimState(States.walking - 1);
        this.setX(x);
        this.setY(y);
        this._flyToX = x - this.width / 2;
        this._flyToY = y - this.height / 2;
        this._flySpeed = PlayerNode.DEFAULT_FLY_SPEED;
    }

    setAttackBox(a) {
        this.attackBox = a;
    }

    nextWave() {
        const acc = Math.min(this.getAccuracy() / 100.0, 2.0);
        this.givePoints(Math.floor(1000 * acc));
    }

    updateFloor(newFloor) {
        this.floor = newFloor;
    }

    resetAcc() {
        this._thrownAttacks = 0;
        this._hitAttacks = 0;
    }

    getAccuracy() {
        if (this._thrownAttacks === 0) return 100;
        return Math.floor(this._hitAttacks / this._thrownAttacks * 100);
    }

    hitSuccess() {
        this._hitAttacks++;
    }

    givePoints(amt) {
        this.textDisplayer.addNew(`+${amt}`);
        this._score += amt;
    }

    getScore() { return this._score; }

    giveAttackBoost(amt) {
        this._attackBoostMessage = true;
        this._attackBoostMsgTimer = 0;
        this._attackBoost += amt;
    }

    giveAttack(type) {
        return this.attackBox ? this.attackBox.add(type) : false;
    }

    get isAttackBoostMessage() { return this._attackBoostMessage; }

    getTextDisplayer() { return this.textDisplayer; }

    eventCollided(sprite) {
        // Nothing - handled by enemies/castle
    }

    update(deltaTime) {
        // Wrapper
    }

    updatePlayer(deltaTime, touches) {
        this.textDisplayer.update(deltaTime);

        if (this._attackBoostMsgTimer < 3) {
            this._attackBoostMsgTimer += deltaTime;
            if (this._attackBoostMsgTimer >= 3) {
                this._attackBoostMessage = false;
            }
        }

        // Input
        if (!this._ignoreInputFlag && !this._disableInputFlag) {
            for (const touch of touches) {
                const tx = touch.x;
                const ty = touch.y;

                this.velocityX = tx - this.gameX - this.width / 2;
                this.velocityY = ty - this.gameY - this.height / 2;
                this._flyToX = tx;
                this._flyToY = ty;

                // Normalize
                const mag = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
                if (mag > 0) {
                    this.velocityX = (this.velocityX / mag) * this._flySpeed;
                    this.velocityY = (this.velocityY / mag) * this._flySpeed;
                }
            }
        } else if (this._ignoreInputFlag) {
            this._ignoreInputFlag = false;
        }

        // Invincibility
        if (this._isInvincible) {
            this._invTime -= deltaTime;
            this._visTimer += deltaTime;
            if (this._visTimer > 0.1) {
                this.toggleVisibility();
                this._visTimer = 0;
            }
            if (this._invTime <= 0) {
                this._isInvincible = false;
                this._visTimer = 0;
                this.setCollidable(true);
                this.setVisibility(true);
            }
        }

        // Crashing
        if (this._crashing) {
            this._attacking = false;
            this.velocityY += 400 * deltaTime; // fall
            if (this.gameY >= 480) {
                if (this.lives <= 0) {
                    if (this.screen) this.screen.triggerGameOver('You ran out of lives.');
                }
                this.enableInput();
                if (this.attackBox) this.attackBox.enableAttacks();
                this.setNumberFrames(gameAssets.playerFrames);
                this.resetAnim();
                this.setAnimState(States.walking - 1);
                this._crashing = false;
                this.reset(100, 25);
                this.startMoving(1, 0);
                this.makeInvincible(PlayerNode.RESPAWN_INV_TIME);
            }
        }

        // Attacking animation
        if (this._attacking && !this._crashing) {
            if (this.loopedOnce) {
                this.resetAnim();
                this.setAnimState(States.walking - 1);
                this.setNumberFrames(gameAssets.playerFrames);
                this._attacking = false;
            }
        }

        // Position wrapping and bounds
        this.wrapSprite();
        if (!this._crashing) {
            this.bounceTop();
        }

        // Flip direction
        if (this.velocityX >= 0) {
            this.offsetDrawX = -6;
            this.flipped = false;
        } else {
            this.offsetDrawX = 6;
            this.flipped = true;
        }

        // Ground collision
        if (this.isCollidable()) {
            const checkX = Math.floor(this.gameX) + Math.floor(this.width / 2);
            if (checkX >= 0 && checkX < this.floor.length) {
                if (this.gameY + this.height > this.floor[checkX]) {
                    this.crash();
                }
            } else if (checkX < 0) {
                if (this.gameY + this.height > this.floor[0]) {
                    this.crash();
                }
            } else {
                if (this.gameY + this.height > this.floor[this.floor.length - 1]) {
                    this.crash();
                }
            }
        }
    }

    ignoreInput() { this._ignoreInputFlag = true; }
    disableInput() { this._disableInputFlag = true; }
    enableInput() { this._disableInputFlag = false; }

    startMoving(x, y) {
        this.velocityX = x * this._flySpeed;
        this.velocityY = y * this._flySpeed;
    }

    makeInvincible(time) {
        this._isInvincible = true;
        this._invTime = time;
        this.setCollidable(false);
        this.toggleVisibility();
    }

    crash() {
        if (this._crashing) return;
        this.disableInput();
        if (this.attackBox) this.attackBox.disableAttacks();
        this.setNumberFrames(1);
        this.resetAnim();
        this.setAnimState(States.dying - 1);
        this.setCollidable(false);
        this.setVelocity(0, -240);
        this._crashing = true;
        this.lives--;
    }

    isCrashing() { return this._crashing; }

    useAttack(type) {
        if (type === Types.aProtector) {
            if (!this.screen || this.screen.getProtector()) return false;

            const pm = new ProtectorMonkeyNode(
                this.screen, 0, 0, this.floor, 40, 100
            );
            this.screen.setProtector(pm);
            this.screen.resetProtector();
            pm.cacheLand();
            pm.setY(-pm.height);
            pm.setVelocity(0, 300);
            audioManager.play('gorilla');
            return true;
        } else {
            const attack = AttackLookUp.createAttack(type, this, this.floor);
            if (!attack) return false;
            attack.boostDamage(this._attackBoost);

            const slot = this._findOpenAttack();
            if (slot < 0) return false;

            this.attacks[slot] = attack;
            this._attacking = true;
            this.resetAnim();
            this.setAnimState(States.attacking - 1);
            this.setNumberFrames(gameAssets.playerAttackFrames);
            this._thrownAttacks++;
            return true;
        }
    }

    decThrown() {
        this._thrownAttacks--;
    }

    destroyAttack(deadAttack) {
        for (let i = 0; i < this.attacks.length; i++) {
            if (this.attacks[i] === deadAttack) {
                if (this.attacks[i]) this.attacks[i].dispose();
                this.attacks[i] = null;
                break;
            }
        }
    }

    addAttack(a) {
        const slot = this._findOpenAttack();
        if (slot >= 0) {
            this.attacks[slot] = a;
        }
    }

    _findOpenAttack() {
        for (let i = 0; i < this.attacks.length; i++) {
            if (this.attacks[i] === null) return i;
        }
        return -1;
    }
}
