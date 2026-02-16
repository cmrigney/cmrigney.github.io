// Animation States
export const States = {
    standing: 0,
    walking: 1,
    attacking: 2,
    dying: 3
};

// Entity Types
export const Types = {
    // Player & Castle
    pPlayer: 1,
    pCastle: 2,

    // Enemies (100-199 real enemies, 200+ throwables)
    eZookeeper: 100,
    ePaperBoy: 101,
    eTim: 102,
    eCop: 103,
    eRhino: 104,
    eZombie: 105,
    eJug: 106,

    eNewspaper: 200,
    eBullet: 201,
    eKnife: 202,

    // Power-ups
    pHealth: 600,
    pCollectable: 601,

    // Attacks
    aBananaShot: 1000,
    aSmallExplosion: 1001,
    aBananaIce: 1002,
    aBananaBomb: 1003,
    aBananaCluster: 1004,
    aShooterSpawner: 1005,
    aBananaBlackHole: 1006,
    aProtector: 1007,

    // Wave ticket
    tWaveTicket: 2000,

    resolveThrowsType(type) {
        switch (type) {
            case this.ePaperBoy: return this.eNewspaper;
            case this.eTim: return this.eKnife;
            case this.eCop: return this.eBullet;
            default: return this.eNewspaper;
        }
    }
};

// Enter Side
export const EnterSide = {
    right: 0,
    left: 1,
    both: 2
};
