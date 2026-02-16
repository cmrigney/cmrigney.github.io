import { Types } from './game-types.js';
import { gameAssets } from './game-assets.js';
import { AttackRotatingSimple } from './attack-rotating-simple.js';
import { AttackBomb } from './attack-bomb.js';
import { AttackSmallExplosion } from './attack-small-explosion.js';
import { AttackIce } from './attack-ice.js';
import { AttackClusterBomb } from './attack-cluster-bomb.js';
import { AttackBlackHole } from './attack-black-hole.js';
import { AttackSpawner } from './attack-spawner.js';

export class AttackLookUp {
    static friction = 20.0;
    static gravity = 200.0;

    static createAttack(attackType, player, floor) {
        switch (attackType) {
            case Types.aBananaShot: {
                const img = gameAssets.getImage('BananaShot');
                const w = img ? img.width : 24;
                const h = img ? img.height : 24;
                const x = player.getX() + Math.floor(player.width / 2) - Math.floor(w / 2);
                const y = player.getY() + Math.floor(player.height / 2);
                const ars = new AttackRotatingSimple(
                    'BananaShot', attackType, x, y, w, h,
                    1, 1, 0.9, floor, player,
                    this.friction, this.gravity, 20
                );
                ars.setVelocity(player.velocityX, player.velocityY);
                return ars;
            }

            case Types.aBananaCluster: {
                const img = gameAssets.getImage('BananaClusterBomb');
                const w = img ? img.width : 30;
                const h = img ? img.height : 30;
                const x = player.getX() + Math.floor(player.width / 2) - Math.floor(w / 2);
                const y = player.getY() + Math.floor(player.height / 2);
                const acb = new AttackClusterBomb(
                    'BananaClusterBomb', attackType, x, y, w, h,
                    1, 1, 0.75, floor, player,
                    this.friction, this.gravity, 50
                );
                acb.setVelocity(player.velocityX, player.velocityY - 90);
                return acb;
            }

            case Types.aBananaBomb: {
                const img = gameAssets.getImage('BananaBomb');
                const w = img ? img.width : 24;
                const h = img ? img.height : 24;
                const x = player.getX() + Math.floor(player.width / 2) - Math.floor(w / 2);
                const y = player.getY() + Math.floor(player.height / 2);
                const ab = new AttackBomb(
                    'BananaBomb', attackType, x, y, w, h,
                    1, 1, 0.75, floor, player,
                    this.friction, this.gravity, 20
                );
                ab.setVelocity(player.velocityX, player.velocityY);
                return ab;
            }

            case Types.aSmallExplosion: {
                const ase = new AttackSmallExplosion(
                    'wholeExplosion', attackType, 0, 0, 64, 64,
                    1, 1, 1.3, floor, player, 60
                );
                ase.setVelocity(0, 0);
                ase.setNumberFrames(gameAssets.wholeExplosionFrames);
                ase.calcLengthPerFrame(gameAssets.wholeExplosionSpeed);
                ase.continuous = true;
                ase.resetAnim();
                return ase;
            }

            case Types.aShooterSpawner: {
                return new AttackSpawner(
                    Types.aShooterSpawner, Types.aBananaShot,
                    0.3, 45, player, floor
                );
            }

            case Types.aBananaBlackHole: {
                const img = gameAssets.getImage('BananaBlackHole');
                const w = img ? img.width : 24;
                const h = img ? img.height : 24;
                const x = player.getX() + Math.floor(player.width / 2) - Math.floor(w / 2);
                const y = player.getY() + Math.floor(player.height / 2);
                const abh = new AttackBlackHole(
                    'BananaBlackHole', attackType, x, y, w, h,
                    1, 1, 0.75, floor, player,
                    this.friction, this.gravity, 99999999
                );
                abh.setVelocity(player.velocityX, player.velocityY);
                return abh;
            }

            case Types.aBananaIce: {
                const img = gameAssets.getImage('iceBanana');
                const w = img ? img.width : 24;
                const h = img ? img.height : 24;
                const x = player.getX() + Math.floor(player.width / 2) - Math.floor(w / 2);
                const y = player.getY() + Math.floor(player.height / 2);
                const ai = new AttackIce(
                    'iceBanana', attackType, x, y, w, h,
                    1, 1, 0.75, floor, player,
                    this.friction, this.gravity, 10
                );
                ai.setVelocity(player.velocityX, player.velocityY);
                return ai;
            }

            default:
                return null;
        }
    }

    static getPoints(type) {
        switch (type) {
            case Types.aBananaBlackHole: return 300;
            case Types.aBananaBomb: return 10;
            case Types.aBananaCluster: return 10;
            case Types.aBananaIce: return 300;
            case Types.aBananaShot: return 10;
            case Types.aProtector: return 300;
            case Types.aSmallExplosion: return 20;
            default: return 10;
        }
    }
}
