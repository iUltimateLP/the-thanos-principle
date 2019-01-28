/*
    File: pickup.js
    Description: Pickupable item
*/

// Pickup items are just objects with automatic pickup handling
class Pickup {
    // Constructor which allows us to feed in a "pickup template" and the coordinates
    constructor(template, x, y) {
        // Apply the input variables
        this.item = template.item;

        // Create the underlying object with the data we got
        this.object = new GameObject({
            sprite: {
                spriteSheet: this.item.image,
                tileCount: 1,
                tickRate: 0,
                tileWidth: 32,
                tileHeight: 32,
                renderWidth: 64,
                renderHeight: 64,
                renderPixelated: true
            },
            interactable: true,
            renderLayer: 14,
            animated: false,
            collidable: false,
            onInteract: this.onObjectInteract.bind(this) // Without the .bind, the `this` keyword in onObjectInteract would be GameObject instance, not this pickup
        }, x, y);

        // Update the underlying object
        this.object.update();
    }

    // Called when the user interacts with the object
    onObjectInteract() {
        if (player.getInventory().getItems().length < 2) {
            // Add this item to the player's inventory
            player.getInventory().addItem(this.item);

            // Remove this pickup from the screen
            this.object.remove();

            // Notify the user
            utils.displayDialogBox("You picked up a " + this.item.name, 2000);
        }
        else {
            utils.displayDialogBox("Even Thanos can't carry more.", 2000);
        }
    }
}
