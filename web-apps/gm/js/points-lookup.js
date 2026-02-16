import { Types } from './game-types.js';
import { gameAssets } from './game-assets.js';

// Lookup functions extracted to avoid circular dependencies between
// enemy-node.js <-> enemy-lookup.js <-> enemy subclasses
export function getAttackPoints(type) {
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

export function lookUpEnemyFrames(type, state) {
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

export function getEnemyPoints(type) {
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
