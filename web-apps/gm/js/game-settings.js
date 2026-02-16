export class GameSettings {
    constructor() {
        this.soundEnabled = true;
        this.currentWave = 1;
        this.waveData = null;
        this.loaded = false;
        this.hasShownMemorial = false;

        this.names = new Array(10).fill('');
        this.highScores = new Array(10).fill(0);
        this.highWaves = new Array(10).fill(0);
    }

    load() {
        try {
            this.soundEnabled = JSON.parse(localStorage.getItem('soundEnabled') ?? 'true');
            this.hasShownMemorial = JSON.parse(localStorage.getItem('hasShownMemorial') ?? 'false');
            const savedNames = JSON.parse(localStorage.getItem('names'));
            if (savedNames) this.names = savedNames;
            const savedScores = JSON.parse(localStorage.getItem('highScores'));
            if (savedScores) this.highScores = savedScores;
            const savedWaves = JSON.parse(localStorage.getItem('highWaves'));
            if (savedWaves) this.highWaves = savedWaves;
        } catch (e) {
            // Ignore parse errors
        }
        this.loaded = true;
    }

    save() {
        try {
            localStorage.setItem('soundEnabled', JSON.stringify(this.soundEnabled));
            localStorage.setItem('hasShownMemorial', JSON.stringify(this.hasShownMemorial));
            localStorage.setItem('names', JSON.stringify(this.names));
            localStorage.setItem('highScores', JSON.stringify(this.highScores));
            localStorage.setItem('highWaves', JSON.stringify(this.highWaves));
        } catch (e) {
            // Ignore storage errors
        }
    }

    addScore(name, score, wave) {
        for (let i = 0; i < this.highScores.length; i++) {
            if (this.highScores[i] < score) {
                // Shift down
                for (let j = this.highScores.length - 1; j > i; j--) {
                    this.names[j] = this.names[j - 1];
                    this.highScores[j] = this.highScores[j - 1];
                    this.highWaves[j] = this.highWaves[j - 1];
                }
                this.names[i] = name;
                this.highScores[i] = score;
                this.highWaves[i] = wave;
                break;
            }
        }
        this.save();
    }

    initWaveData() {
        // WaveReader is set externally after waves.txt is fetched
    }
}

// Singleton
export const gameSettings = new GameSettings();
