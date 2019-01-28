/*
    File: pressurePlate.js
    Description: A pressure plate can be activated using the player or putting an item on it
*/

class PressurePlate {
    // Constructor
    constructor(index, x, y) {
        // We use an index, so the callback does know which instance was interacted with
        this.index = index;

        // Create the game object
        this.object = new GameObject({
            sprite: {
                spriteSheet: "assets/img/objects/plate-off.png",
                tileCount: 1,
                tickRate: 0,
                tileWidth: 32,
                tileHeight: 32,
                renderWidth: 64,
                renderHeight: 64,
                renderPixelated: true
            },
            interactable: true,
            name: "pressurePlate",
            renderLayer: 13,
            animated: false,
            collidable: false,
            overlappable: true,
            onInteract: this.onInteract.bind(this),
            onStartOverlap: this.onStartOverlap.bind(this),
            onEndOverlap: this.onEndOverlap.bind(this)
        }, x, y);

        // Create a new game object for the items laying on the pressure plates, doesn't have any visuals first
        this.item = new GameObject({
            sprite: {
                spriteSheet: "",
                tileCount: 1,
                tickRate: 0,
                tileWidth: 32,
                tileHeight: 32,
                renderWidth: 48,
                renderHeight: 48,
                renderPixelated: true  
            },
            interactable: false,
            name: "pressurePlateItem",
            renderLayer: 14, // 1 under the player
            animated: false,
            collidable: false
        }, x+5, y+5);

        // Hide the sprite first
        this.item.sprite.hide();
        this.state = false;
        this.itemPlaced = "";
        this.disabled = false;
    }

    // Called when the player starts walking on the plate
    onStartOverlap() {
        // Make sure there isn't an item and this plate isn't disabled
        if (!this.itemPlaced && !this.disabled) {
            this.setState(true);

            // Play the plate sound
            audioSystem.playSound(sounds.plate);
        }
    }

    // Called when the player walks away
    onEndOverlap() {
        // Make sure there isn't an item and this plate isn't disabled
        if (!this.itemPlaced && !this.disabled) {
            this.setState(false);
        }
    }

    // Called when interacting with the plate (to put an item on it)
    onInteract() {
        // Filter out the hammer
        var items = player.getInventory().getItems().filter(item => item.name != "hammer");

        // If we have an item in the inventory which is usable for placing on the plate...
        if (items.length > 0) {
            // Remove it from the inventory, update the sprite, and enable the pressure plate
            player.getInventory().removeItemByName(items[0].name);
            this.item.sprite.setSpritesheet(items[0].image);
            this.item.sprite.show();
            this.itemPlaced = items[0];
            this.setState(true);
        } else {
            utils.displayDialogBox("I need something heavy...", 2000);
        }
    }

    // Updates the pressed state
    setState(newState) {
        this.state = newState;

        // Notify the callback
        if (this.onPlateStateChanged) {
            this.onPlateStateChanged(newState);
        }

        this.renderState();
    }

    // Disables this plate (so the player can't stand on it or drop items on it)
    disable() {
        this.setState(true);
        this.object.setInteractable(false);
        this.disabled = true;
    }

    // Updates the sprite based on the state
    renderState() {
        this.object.sprite.setSpritesheet("assets/img/objects/plate-" + (this.state ? "on" : "off") + ".png");
    }

    // Returns the state
    getState() {
        return this.state;
    }
}
