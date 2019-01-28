/*
    File: breakable.js
    Description: Object which has a health, by interacting with it the health is reduced by 1 until the object "dies"
*/

// Object which has "health", interacting with it will reduce the health
class Breakable {
    // Constructor taking up the health, a sprite template and coordinates
    constructor(health, sprite, x, y) {
        this.health = health;
        this.maxHealth = health;

        // Create the new game object
        this.object = new GameObject({
            sprite: sprite,
            interactable: true,
            name: "breakable",
            renderLayer: 14, // 1 above the player
            animated: false,
            collidable: true,
            onInteract: this.onInteract.bind(this)
        }, x, y);
    }

    // Handles the interaction
    onInteract() {
        // If the player has the hammer for breaking a breakable...
        if (player.getInventory().hasItem("hammer")) {
            // ...decrement the health 
            this.health--;

            // Random sound for breaking the stones
            var stoneSounds = [sounds.rock1, sounds.rock2, sounds.rock3];
            var i = utils.clamp(Math.round(Math.random()*3)-1, 0, stoneSounds.length);
            audioSystem.playSound(stoneSounds[i], false);

            // If the health is 0, notify the callback, and remove it from screen
            if (this.health == 0) {
                if (this.onBroken) {
                    this.onBroken();
                }

                this.object.setInteractable(false);
                this.object.remove();
            } 
            // Otherwise render the new health stage
            else {
                this.renderStage();
            }
        } 
        // No tool to break
        else {
            utils.displayDialogBox("Reality is often disappointing, I need a tool to break this.", 2000);
        }
    }

    // Breakables are using sprite sheets, so we can just set the frame on the sheet
    renderStage() {
        this.object.sprite.setFrame(this.maxHealth - this.health);
    }
};
