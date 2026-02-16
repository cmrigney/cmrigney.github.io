import { Types, EnterSide } from './game-types.js';
import { gameAssets } from './game-assets.js';
import { EnemyNode } from './enemy-node.js';
import { EnemyThrowerNode } from './enemy-thrower-node.js';
import { EnemyCopNode } from './enemy-cop-node.js';
import { EnemyThrowableNode } from './enemy-throwable-node.js';

export class EnemyLookUp {
    static resolvedSheetName = null;
    static resolvedWidth = 0;
    static resolvedHeight = 0;
    static resolvedXBounds = 1;
    static resolvedYBounds = 1;
    static resolvedBoundsScale = 0.75;
    static resolvedX = 0;
    static resolvedY = 0;
    static resolvedDir = EnemyNode.RIGHT;

    static resolve(enemyType, floor, enterSide) {
        let side = enterSide;

        switch (enemyType) {
            case Types.eZookeeper:
                this.resolvedSheetName = 'zookeeperAnimations';
                this.resolvedWidth = 40; this.resolvedHeight = 70;
                this.resolvedXBounds = 1; this.resolvedYBounds = 2;
                this.resolvedBoundsScale = 0.65;
                break;
            case Types.ePaperBoy:
                this.resolvedSheetName = 'paperboyanimations';
                this.resolvedWidth = 40; this.resolvedHeight = 70;
                this.resolvedXBounds = 1; this.resolvedYBounds = 2;
                this.resolvedBoundsScale = 0.65;
                break;
            case Types.eTim:
                this.resolvedSheetName = 'timanimations';
                this.resolvedWidth = 40; this.resolvedHeight = 70;
                this.resolvedXBounds = 1; this.resolvedYBounds = 2;
                this.resolvedBoundsScale = 0.65;
                break;
            case Types.eCop:
                this.resolvedSheetName = 'copanimations';
                this.resolvedWidth = 40; this.resolvedHeight = 82;
                this.resolvedXBounds = 1; this.resolvedYBounds = 2;
                this.resolvedBoundsScale = 0.65;
                break;
            case Types.eRhino:
                this.resolvedSheetName = 'rhinoAnimations';
                this.resolvedWidth = 80; this.resolvedHeight = 60;
                this.resolvedXBounds = 2; this.resolvedYBounds = 1;
                this.resolvedBoundsScale = 0.6;
                break;
            case Types.eZombie:
                this.resolvedSheetName = 'zombieMonkeyAnimations';
                this.resolvedWidth = 43; this.resolvedHeight = 40;
                this.resolvedXBounds = 1; this.resolvedYBounds = 1;
                this.resolvedBoundsScale = 0.85;
                break;
            case Types.eJug:
                this.resolvedSheetName = 'jugAnimations';
                this.resolvedWidth = 56; this.resolvedHeight = 76;
                this.resolvedXBounds = 1; this.resolvedYBounds = 2;
                this.resolvedBoundsScale = 0.75;
                break;
            case Types.eNewspaper:
                this.resolvedSheetName = 'newspaper';
                this.resolvedWidth = 20; this.resolvedHeight = 20;
                this.resolvedXBounds = 1; this.resolvedYBounds = 1;
                this.resolvedBoundsScale = 0.75;
                return;
            case Types.eBullet:
                this.resolvedSheetName = 'bullet';
                this.resolvedWidth = 15; this.resolvedHeight = 20;
                this.resolvedXBounds = 1; this.resolvedYBounds = 1;
                this.resolvedBoundsScale = 0.75;
                return;
            case Types.eKnife:
                this.resolvedSheetName = 'knife';
                this.resolvedWidth = 30; this.resolvedHeight = 30;
                this.resolvedXBounds = 1; this.resolvedYBounds = 1;
                this.resolvedBoundsScale = 0.75;
                return;
            default:
                break;
        }

        // Determine enter side
        if (side === EnterSide.both) {
            side = Math.random() >= 0.5 ? EnterSide.left : EnterSide.right;
        }

        if (side === EnterSide.left) {
            this.resolvedX = -this.resolvedWidth;
            this.resolvedY = Math.floor(floor[0]) - this.resolvedHeight;
            this.resolvedDir = EnemyNode.RIGHT;
        } else if (side === EnterSide.right) {
            this.resolvedX = 800;
            this.resolvedY = Math.floor(floor[floor.length - 1]) - this.resolvedHeight;
            this.resolvedDir = EnemyNode.LEFT;
        }
    }

    static lookUpFrames(type, state) {
        switch (type) {
            case Types.eZookeeper: return gameAssets.zooKeeperFrames[state];
            case Types.ePaperBoy: return gameAssets.paperBoyFrames[state];
            case Types.eTim: return gameAssets.timFrames[state];
            case Types.eCop: return gameAssets.copFrames[state];
            case Types.eRhino: return gameAssets.rhinoFrames[state];
            case Types.eZombie: return gameAssets.zombieMonkeyFrames[state];
            case Types.eJug: return gameAssets.jugFrames[state];
            case Types.eNewspaper: return gameAssets.newspaperFrames;
            case Types.eBullet: return gameAssets.bulletFrames;
            case Types.eKnife: return gameAssets.knifeFrames;
            default: return 1;
        }
    }

    static createEnemy(screen, sheetName, type, x, y, width, height,
                       xBounds, yBounds, scale, health, attackDamage,
                       walkSpeed, floor, dir) {
        switch (type) {
            case Types.ePaperBoy:
            case Types.eTim:
                return new EnemyThrowerNode(screen, sheetName, type, x, y, width, height,
                    xBounds, yBounds, scale, health, attackDamage, walkSpeed, floor, dir);
            case Types.eCop:
                return new EnemyCopNode(screen, sheetName, type, x, y, width, height,
                    xBounds, yBounds, scale, health, attackDamage, walkSpeed, floor, dir, 300);
            case Types.eNewspaper:
            case Types.eBullet:
            case Types.eKnife:
                return new EnemyThrowableNode(screen, sheetName, type, x, y, width, height,
                    xBounds, yBounds, scale, health, attackDamage, walkSpeed, floor, dir);
            default:
                return new EnemyNode(screen, sheetName, type, x, y, width, height,
                    xBounds, yBounds, scale, health, attackDamage, walkSpeed, floor, dir);
        }
    }

    static getPoints(type) {
        switch (type) {
            case Types.eCop: return 120;
            case Types.ePaperBoy: return 140;
            case Types.eRhino: return 250;
            case Types.eTim: return 120;
            case Types.eZombie: return 150;
            case Types.eZookeeper: return 100;
            case Types.eBullet: return 200;
            case Types.eKnife: return 150;
            case Types.eNewspaper: return 150;
            case Types.eJug: return 400;
            default: return 100;
        }
    }
}
