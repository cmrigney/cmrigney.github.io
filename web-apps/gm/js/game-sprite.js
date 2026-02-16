import { gameAssets } from './game-assets.js';
import { States } from './game-types.js';

export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 480;

class BoundingSphere {
    constructor(cx, cy, radius) {
        this.centerX = cx;
        this.centerY = cy;
        this.radius = radius;
        this.isCollidable = true;
    }

    addX(dx) { this.centerX += dx; }
    addY(dy) { this.centerY += dy; }

    collidesWith(other, selfDelta, otherDelta) {
        if (!this.isCollidable || !other.isCollidable) return false;
        const dx = (this.centerX + selfDelta[0]) - (other.centerX + otherDelta[0]);
        const dy = (this.centerY + selfDelta[1]) - (other.centerY + otherDelta[1]);
        const distSq = dx * dx + dy * dy;
        const r = this.radius + other.radius;
        return distSq <= r * r;
    }
}

export class GameSprite {
    constructor(sheetName, type, x, y, width, height, xBounds, yBounds, scale) {
        this.sheetName = sheetName;
        this.type = type;
        this.width = width;
        this.height = height;
        this.gameX = x;
        this.gameY = y;

        this.velocityX = 0;
        this.velocityY = 0;
        this.deltaVX = 0;
        this.deltaVY = 0;

        // Animation
        this.animState = States.standing;
        this.animFrame = 0;
        this.animTimer = 0;
        this.animEnabled = true;
        this.animPerSec = 5;
        this.lengthPerFrame = 0.2;
        this.framesPerAnim = 5;
        this.loopedOnce = false;
        this.continuous = false;

        // Visual
        this.visible = true;
        this.flipped = false;
        this.offsetDrawX = 0;
        this.offsetDrawY = 0;

        // Collision
        this.boundSpheres = [];
        this.collisionIgnoreList = new Set();

        // Terminal velocity
        this._hasTerminal = false;
        this._termVelocity = 0;

        // Create bounding spheres
        this._createBoundingSpheres(xBounds, yBounds);
        this._scaleBounds(scale);
    }

    _createBoundingSpheres(xCount, yCount) {
        const minDim = Math.min(this.width, this.height);
        const divisor = this.width < this.height ? xCount : yCount;
        const radius = minDim / divisor / 2.0;

        this.boundSpheres = [];
        for (let xx = 0; xx < xCount; xx++) {
            for (let yy = 0; yy < yCount; yy++) {
                const cx = this.gameX + (this.width / xCount) * xx + radius;
                const cy = this.gameY + (this.height / yCount) * yy + radius;
                this.boundSpheres.push(new BoundingSphere(cx, cy, radius));
            }
        }
    }

    _scaleBounds(scalar) {
        for (const s of this.boundSpheres) {
            s.radius *= scalar;
        }
    }

    // Position
    setX(x) {
        const diff = x - this.gameX;
        this.gameX = x;
        for (const s of this.boundSpheres) s.addX(diff);
    }

    setY(y) {
        const diff = y - this.gameY;
        this.gameY = y;
        for (const s of this.boundSpheres) s.addY(diff);
    }

    addX(dx) {
        this.gameX += dx;
        for (const s of this.boundSpheres) s.addX(dx);
    }

    addY(dy) {
        this.gameY += dy;
        for (const s of this.boundSpheres) s.addY(dy);
    }

    getX() { return Math.floor(this.gameX); }
    getY() { return Math.floor(this.gameY); }

    // Velocity
    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;
    }

    fall(deltaGravity) {
        this.velocityY += deltaGravity;
        if (this._hasTerminal && this.velocityY > this._termVelocity) {
            this.velocityY = this._termVelocity;
        }
    }

    setTerminalVelocity(vel) {
        this._hasTerminal = true;
        this._termVelocity = vel;
    }

    stopHorizontal(deltaFriction) {
        if (this.velocityX > 0) {
            this.velocityX -= deltaFriction;
            if (this.velocityX < 0) this.velocityX = 0;
        } else if (this.velocityX < 0) {
            this.velocityX += deltaFriction;
            if (this.velocityX > 0) this.velocityX = 0;
        }
    }

    boost(force) {
        if (this.velocityX > 0) {
            this.velocityX += force;
        } else if (this.velocityX < 0) {
            this.velocityX -= force;
        }
    }

    // Collision
    setCollidable(collidable) {
        for (const s of this.boundSpheres) {
            s.isCollidable = collidable;
        }
    }

    isCollidable() {
        return this.boundSpheres.length > 0 && this.boundSpheres[0].isCollidable;
    }

    collidesWith(other) {
        const selfDelta = [this.deltaVX, this.deltaVY];
        const otherDelta = [other.deltaVX, other.deltaVY];
        for (const sphere of this.boundSpheres) {
            for (const otherSphere of other.boundSpheres) {
                if (sphere.collidesWith(otherSphere, selfDelta, otherDelta)) {
                    return true;
                }
            }
        }
        return false;
    }

    addIgnoreCollision(sprite) {
        this.collisionIgnoreList.add(sprite);
    }

    isIgnoring(sprite) {
        return this.collisionIgnoreList.has(sprite);
    }

    // Animation
    setAnimState(state) {
        this.animState = state;
    }

    setNumberFrames(num) {
        this.framesPerAnim = num;
    }

    calcLengthPerFrame(animationsPerSec) {
        this.animPerSec = animationsPerSec;
        this.lengthPerFrame = 1.0 / this.animPerSec;
    }

    resetAnim() {
        this.animFrame = 0;
        this.animTimer = 0;
        this.loopedOnce = false;
    }

    toggleVisibility() {
        this.visible = !this.visible;
    }

    setVisibility(vis) {
        this.visible = vis;
    }

    // Update
    updateBase(deltaTime) {
        this.deltaVX = this.velocityX * deltaTime;
        this.deltaVY = this.velocityY * deltaTime;
    }

    updateSprite(deltaTime, collidables) {
        this.updateBase(deltaTime);

        // Check collisions
        let collided = false;
        if (collidables) {
            for (const other of collidables) {
                if (!other || other === this || this.isIgnoring(other)) continue;
                if (this.collidesWith(other)) {
                    this.addX(this.deltaVX);
                    this.addY(this.deltaVY);
                    other.addX(other.deltaVX);
                    other.addY(other.deltaVY);
                    this.eventCollided(other);
                    collided = true;
                    break;
                }
            }
        }

        // Move (skip if collision branch already moved)
        if (!collided) {
            this.addX(this.deltaVX);
            this.addY(this.deltaVY);
        }

        // Animation
        if (this.animEnabled) {
            this.animTimer += deltaTime;
            if (this.animTimer >= this.lengthPerFrame) {
                this.animFrame++;
                if (this.animFrame >= this.framesPerAnim) {
                    this.animFrame = 0;
                    this.loopedOnce = true;
                }
                this.animTimer = 0;
            }
        }
    }

    // Rendering
    draw(ctx) {
        if (!this.visible) return;

        const img = gameAssets.getImage(this.sheetName);
        if (!img) return;

        const displayX = this.gameX + this.offsetDrawX;
        const displayY = this.gameY + this.offsetDrawY;

        // Calculate source rect in sprite sheet
        let srcX = this.animFrame * this.width;
        let srcY = this.animState * this.height;
        if (this.continuous && img.width > 0) {
            srcY += Math.floor(srcX / img.width) * this.height;
            srcX = srcX % img.width;
        }

        gameAssets.drawFrameFromImage(ctx, img, srcX, srcY, this.width, this.height,
            displayX, displayY, this.width, this.height, this.flipped);
    }

    // Screen wrapping
    wrapSprite() {
        if (this.gameX > SCREEN_WIDTH) {
            this.setX(-this.width);
        } else if (this.gameX + this.width <= 0) {
            this.setX(SCREEN_WIDTH);
        }
    }

    bounceTop() {
        if (this.gameY < 0) {
            if (this.velocityY < 0) {
                this.velocityY = -this.velocityY;
            }
        }
    }

    // Override points
    eventCollided(sprite) {}
    update(deltaTime) {}
    dispose() {
        this.collisionIgnoreList.clear();
    }
}
