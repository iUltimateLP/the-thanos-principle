/*
    File: lever.js
    Description: A switchable lever
*/

// Switchable lever
class Lever {
    // Constructor taking an index for easy identification, initial state and coordinates
    constructor(index, initialState, x, y) {
        this.state = initialState || false;
        this.index = index;

        // Create a new game object for the lever
        this.object = new GameObject({
            sprite: {
                spriteSheet: "assets/img/objects/lever-off.png",
                tileCount: 1,
                tickRate: 0,
                tileWidth: 36,
                tileHeight: 36,
                renderWidth: 64,
                renderHeight: 64,
                renderPixelated: true
            },
            interactable: true,
            name: "lever",
            renderLayer: 14, // 1 under the player
            animated: false,
            onInteract: this.onInteract.bind(this),
            interactionSound: sounds.leverOn
        }, x, y);

        // Render the lever
        this.renderState();
    }

    // Just disables the interaction
    disable() {
        this.object.setInteractable(false);
    }

    // Handle interaction
    onInteract() {
        // Flip the state
        this.state = !this.state;

        // Render the state
        this.renderState();

        // If the callback is set, fire it
        if (this.onLeverStateChanged) {
            this.onLeverStateChanged(this.index, this.state);
        }
    }

    // Rendering the state will just load the on/off spritesheet from the sprite
    renderState() {
        this.object.sprite.setSpritesheet("assets/img/objects/lever-" + (this.state ? "on" : "off") + ".png");
    }

    // Return the state
    getState() {
        return this.state;
    }
}
