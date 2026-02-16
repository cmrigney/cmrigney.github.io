export class WaveReader {
    constructor(text) {
        this.data = text.split('\n');
        this.index = 0;
    }

    readLine() {
        if (this.index >= this.data.length) return null;
        const line = this.data[this.index];
        this.index++;
        return line;
    }

    reset() {
        this.index = 0;
    }
}
