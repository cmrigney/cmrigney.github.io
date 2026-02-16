import { Types } from './game-types.js';
import { gameAssets } from './game-assets.js';
import { AttackBoxItem } from './attack-box-item.js';
import { SCREEN_HEIGHT } from './game-sprite.js';

export class AttackBox {
    static NUMBER_SLOTS = 5;
    static BUFFER_SPACE = 10;
    static BANANA_ATTACK_DELAY = 0.5;

    constructor(x, y) {
        this.player = null;
        this.attackList = [];
        this.equipped = null;
        this.boxSize = 80;
        this.listOpen = false;
        this.x = x;
        this.y = y;
        this._bananaAttackTimer = 0;
        this._canBananaAttack = true;
        this._attackEnabled = true;
        this._pendingAllowCollect = false;

        // Add default banana shot
        this.add(Types.aBananaShot);
        this.equipped = null;
    }

    add(type) {
        if (this.attackList.length >= AttackBox.NUMBER_SLOTS + 1) {
            this._pendingAllowCollect = true;
            return false;
        }
        const imgName = gameAssets.resolveAttackBoxImageName(type);
        this.attackList.push(new AttackBoxItem(type, imgName));
        if (this.attackList.length === 2) {
            this.equipped = this.attackList[1];
        }
        return true;
    }

    clear() {
        this.attackList = [];
        this.add(Types.aBananaShot);
    }

    contains(type) {
        return this.attackList.some(item => item.type === type);
    }

    update(deltaTime, touches) {
        if (!this._canBananaAttack) {
            this._bananaAttackTimer += deltaTime;
            if (this._bananaAttackTimer >= AttackBox.BANANA_ATTACK_DELAY) {
                this._canBananaAttack = true;
            }
        }

        for (const touchPoint of touches) {
            const tx = Math.floor(touchPoint.x);
            const ty = Math.floor(touchPoint.y);

            if (this.listOpen) {
                if (this.player) this.player.ignoreInput();
                if (this._inBounds(tx, ty, this.x + this.boxSize + AttackBox.BUFFER_SPACE, 0, this.boxSize, 480)) {
                    const high = this.boxSize;
                    const clickedOn = Math.floor(ty / (high + AttackBox.BUFFER_SPACE));
                    const modVal = ty % (high + AttackBox.BUFFER_SPACE);
                    const res = modVal - AttackBox.BUFFER_SPACE;
                    if (res >= 0) {
                        const idx = clickedOn + 1;
                        if (idx < this.attackList.length) {
                            this.equipped = this.attackList[idx];
                        }
                    }
                }
                this.listOpen = false;
                break;
            }

            // Regular banana attack (bottom slot)
            if (this._inBounds(tx, ty, this.x, this.y + (this.boxSize + AttackBox.BUFFER_SPACE) * 2, this.boxSize, 150)) {
                if (this.player) this.player.ignoreInput();
                if (this._canBananaAttack && this._attackEnabled) {
                    if (this.player && this.player.useAttack(Types.aBananaShot)) {
                        this._canBananaAttack = false;
                        this._bananaAttackTimer = 0;
                    }
                }
                break;
            }

            // Equipped attack (middle slot)
            if (this._inBounds(tx, ty, this.x, this.boxSize + AttackBox.BUFFER_SPACE + AttackBox.BUFFER_SPACE, this.boxSize, this.boxSize)) {
                if (this.player) this.player.ignoreInput();
                if (this.equipped && this._attackEnabled) {
                    if (this.player && this.player.useAttack(this.equipped.type)) {
                        const idx = this.attackList.indexOf(this.equipped);
                        if (idx >= 0) this.attackList.splice(idx, 1);
                        if (this._pendingAllowCollect && this.player.screen) {
                            this.player.screen.allowCollect();
                        }
                        if (this.attackList.length >= 2) {
                            this.equipped = this.attackList[1];
                        } else {
                            this.equipped = null;
                        }
                    }
                }
                break;
            }

            // Inventory open (top slot)
            if (this._inBounds(tx, ty, this.x, AttackBox.BUFFER_SPACE, this.boxSize, this.boxSize)) {
                if (this.player) this.player.ignoreInput();
                this.listOpen = true;
                break;
            }
        }
    }

    draw(ctx) {
        // Draw attack list popup
        if (this.listOpen) {
            for (let i = 0; i < AttackBox.NUMBER_SLOTS; i++) {
                const idx = i + 1;
                let imgName;
                if (idx < this.attackList.length) {
                    imgName = this.attackList[idx].imageName;
                } else {
                    imgName = 'NothingAttackBox';
                }
                const img = gameAssets.getImage(imgName);
                if (img) {
                    const drawX = this.x + this.boxSize + AttackBox.BUFFER_SPACE;
                    const drawY = i * (this.boxSize + AttackBox.BUFFER_SPACE);
                    ctx.drawImage(img, drawX, drawY);
                }
            }
        }

        // Draw equip box (top)
        const equipImg = gameAssets.getImage('EquipAttackBox');
        if (equipImg) {
            ctx.drawImage(equipImg, this.x, AttackBox.BUFFER_SPACE);
        }

        // Draw equipped item (middle)
        let eqImgName;
        if (this.attackList.length < 2 || !this.equipped) {
            eqImgName = 'NothingAttackBox';
        } else {
            eqImgName = this.equipped.imageName;
        }
        const eqImg = gameAssets.getImage(eqImgName);
        if (eqImg) {
            ctx.drawImage(eqImg, this.x, this.boxSize + AttackBox.BUFFER_SPACE + AttackBox.BUFFER_SPACE);
        }

        // Draw banana shot (bottom)
        if (this.attackList.length > 0) {
            const bananaImg = gameAssets.getImage(this.attackList[0].imageName);
            if (bananaImg) {
                ctx.drawImage(bananaImg, this.x, this.y + (this.boxSize + AttackBox.BUFFER_SPACE) * 2);
            }
        }
    }

    disableAttacks() { this._attackEnabled = false; }
    enableAttacks() { this._attackEnabled = true; }

    _inBounds(ex, ey, bx, by, bw, bh) {
        return ex >= bx && ex <= bx + bw - 1 && ey >= by && ey <= by + bh - 1;
    }
}
