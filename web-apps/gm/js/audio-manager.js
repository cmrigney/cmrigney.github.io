import { gameSettings } from './game-settings.js';

class AudioManagerClass {
    constructor() {
        this.sounds = {};
        this.pools = {};
        this.poolSize = 4;
    }

    preload() {
        const names = ['hit', 'hit2', 'gunfire', 'blackhole', 'iceshatter', 'throw', 'bomb', 'gorilla'];
        for (const name of names) {
            this.sounds[name] = `assets/${name}.wav`;
            // Create pool of audio elements for overlapping sounds
            this.pools[name] = [];
            for (let i = 0; i < this.poolSize; i++) {
                const audio = new Audio(`assets/${name}.wav`);
                audio.preload = 'auto';
                this.pools[name].push(audio);
            }
        }
    }

    play(name) {
        if (!gameSettings.soundEnabled) return;
        const pool = this.pools[name];
        if (!pool) return;

        // Find an available audio element (not currently playing)
        for (const audio of pool) {
            if (audio.paused || audio.ended) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
                return;
            }
        }
        // All busy - reset and play the first one
        pool[0].currentTime = 0;
        pool[0].play().catch(() => {});
    }

    playHit() {
        if (Math.random() >= 0.5) {
            this.play('hit');
        } else {
            this.play('hit2');
        }
    }
}

export const audioManager = new AudioManagerClass();
