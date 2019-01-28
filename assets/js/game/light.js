/*
    File: light.js
    Description: Interactable light which be white, off, or blue
*/

// Light for the lights puzzle - can be interacted with to set state
class Light {
    // Constructor taking an index for easy identification and coordinates
    constructor(index, x, y) {
        // Store the variables
        this.x = x;
        this.y = y;
        this.index = index;
        this.color = "white";

        // Create a new game object for the (interactable) socket
        this.socket = new GameObject({
            sprite: {
                spriteSheet: "assets/img/objects/light-socket.png",
                tileCount: 1,
                tickRate: 0,
                tileWidth: 32,
                tileHeight: 32,
                renderWidth: 128,
                renderHeight: 128,
                renderPixelated: true
            },
            interactable: false,
            name: "lightSocket",
            renderLayer: 14, // 1 above the player
            animated: false,
            overlappable: false,
            collidable: false,
            interactable: true,
            onInteract: this.onInteract.bind(this)
        }, x, y);

        // Create a new game object for the light shaft (not interactabl)
        this.shaft = new GameObject({
            sprite: {
                spriteSheet: "assets/img/objects/light-shaft-white.png",
                tileCount: 1,
                tickRate: 0,
                tileWidth: 32,
                tileHeight: 64,
                renderWidth: 128,
                renderHeight: 256,
                renderPixelated: true
            },
            interactable: false,
            name: "lightShaft",
            renderLayer: 15, // 1 above the player
            animated: false,
            overlappable: false,
            collidable: false,
            interactable: false
        }, x, y-150);
    }

    // Setting the color will try to load the according sprite sheet from disk
    setColor(newColor) {
        this.color = newColor;
        this.shaft.sprite.setSpritesheet("assets/img/objects/light-shaft-" + newColor + ".png");

        if (newColor != "white") {
            //audioSystem.playSound(sounds.light);
        }
    }

    // On interaction, it just calls the callback with our index. The logic for the puzzle happens in level.js
    onInteract() {
        if (this.onLightActivated) {
            this.onLightActivated(this.index);
        }
    }
}
