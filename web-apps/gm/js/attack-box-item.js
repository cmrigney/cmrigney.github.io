import { gameAssets } from './game-assets.js';

export class AttackBoxItem {
    constructor(type, imageName) {
        this.type = type;
        this.imageName = imageName;
        const img = gameAssets.getImage(imageName);
        this.width = img ? img.width : 64;
        this.height = img ? img.height : 64;
    }
}
