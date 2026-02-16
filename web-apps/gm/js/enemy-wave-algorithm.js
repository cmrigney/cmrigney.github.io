export class EnemyWaveAlgorithm {
    static numOfEnemies = 1;
    static healthFactor = 0;
    static attackDamageFactor = 0;
    static healthFactorForApe = 0;
    static attackDamageFactorForApe = 0;

    static run(factor) {
        let f = factor;
        if (f < 2) f = 2;
        this.numOfEnemies = Math.floor(f * 0.75);
        this.healthFactor = f * 0.75;
        this.attackDamageFactor = f * 0.5;
    }

    static runForProtector(factor) {
        let f = factor;
        if (f < 2) f = 2;
        this.healthFactorForApe = f * 0.5;
        this.attackDamageFactorForApe = f * 0.75;
    }

    static getNextTime() {
        return Math.random() * 5;
    }
}
