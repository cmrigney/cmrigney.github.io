import { AttackRotatingSimple } from './attack-rotating-simple.js';
import { getAttackPoints } from './points-lookup.js';
import { Types } from './game-types.js';
import { audioManager } from './audio-manager.js';
import { SCREEN_HEIGHT } from './game-sprite.js';

export class AttackBomb extends AttackRotatingSimple {
    eventCollided(sprite) {
        if (sprite.type >= 100 && sprite.type <= 500) {
            sprite.takeDamage(this.damage);
            if (this.player) {
                this.player.givePoints(getAttackPoints(this.type));
                if (!this.ignoreAcc) {
                    this.player.hitSuccess();
                }
            }
            this.setIgnoreAcc(true);
            this.explode();
        }
    }

    update(deltaTime) {
        this.doAnimation(deltaTime);
        this.doPhysics(deltaTime);

        // Check for floor hit
        const checkX = Math.floor(this.gameX) + Math.floor(this.width / 2);
        if (checkX >= 0 && checkX < this.floor.length) {
            if (this.gameY + this.height > this.floor[checkX]) {
                this.explode();
                return;
            }
        } else if (this.gameY >= SCREEN_HEIGHT) {
            this.explode();
            return;
        }
    }

    async explode() {
        audioManager.play('bomb');
        if (this.player) {
            // Lazy import to avoid circular dependency
            const { AttackLookUp } = await import('./attack-lookup.js');
            const attack = AttackLookUp.createAttack(Types.aSmallExplosion, this.player, this.floor);
            if (attack) {
                attack.setX(this.gameX);
                attack.setY(this.gameY);
                attack.setIgnoreAcc(this.ignoreAcc);
                this.player.addAttack(attack);
            }
            this.player.destroyAttack(this);
        }
    }
}
