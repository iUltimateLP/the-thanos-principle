/*
    File: laser.js
    Description: Laser which fires a callback if the player steps in it
*/

// Interval between on/off states
const LASER_INTERVAL = 2000;

// A laser is an entity which kills the player once he touches the laser
class Laser {
    // Constructor taking coordinates and size
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        
        // Create a new game object for the laser
        this.object = new GameObject({
            sprite: {
                spriteSheet: "assets/img/objects/laser-vertical-2.png",
                tileCount: 1,
                tickRate: 0,
                tileWidth: 16,
                tileHeight: 16,
                renderWidth: w,
                renderHeight: h,
                renderPixelated: true
            },
            interactable: false,
            name: "laser",
            renderLayer: 14, // 1 above the player
            animated: false,
            overlappable: true,
            collidable: false,
            onStartOverlap: this.onStartOverlap.bind(this)
        }, x, y);

        // Start the laser ticking
        this.tick();
    }

    // This gets called in the LASER_INTERVAL interval using setTimeout
    tick() {
        // Simply toggles the laser sprite visibility
        this.object.sprite.isVisible() ? this.object.sprite.hide() : this.object.sprite.show();

        // Sets a timeout for the next tick
        setTimeout(this.tick.bind(this), LASER_INTERVAL);
    }

    // Called when the player starts overlapping
    onStartOverlap() {
        // If the laser is on (sprite visiible) and the callback is bound, fire it
        if (this.object.sprite.isVisible() && this.onLaserDeath) {
            this.onLaserDeath();
        }
    }
}
