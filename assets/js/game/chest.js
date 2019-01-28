/*
    File: chest.js
    Description: A interactable chest which can contain items
*/

// Openable chest which can contain an item
class Chest {
    // Constructor taking up an item and coordinates
    constructor(item, x, y) {
        this.item = item;

        // Create the game object for the chest
        this.object = new GameObject({
            sprite: {
                spriteSheet: "assets/img/objects/chest-metal.png",
                tileCount: 1,
                tickRate: 0,
                tileWidth: 16,
                tileHeight: 32,
                renderWidth: 64,
                renderHeight: 128,
                renderPixelated: true
            },
            interactable: true,
            name: "chest",
            renderLayer: 14, // 1 above the player
            animated: false,
            onInteract: this.onInteract.bind(this),
            interactionSound: sounds.crateOpen
        }, x, y);

        // Initialize the inventory component for this chest
        this.inventory = new Inventory();

        // If an item was set, add it to the inventory
        if (this.item) {
            this.inventory.addItem(item);
        }
    }

    // Handles the interaction
    onInteract() {
        // If an item was set, the chest has this item in stock, and the player has min. one free slot...
        if (this.item && this.inventory.hasItem(this.item.name) && player.getInventory().getItems().length < 2) {
            // ...move the item from this inventory to the player inventory
            this.inventory.transactItem(this.item.name, player.getInventory());

            // Show the dialog box UI
            utils.displayDialogBox("You found a " + this.item.friendlyName + " in this chest!", 2000);
        } 
        // We do have the item, but the player's inventory is full
        else if (this.item && this.inventory.hasItem(this.item.name)) {
            utils.displayDialogBox("Even Thanos can't carry more.", 2000);
        } 
        // The chest is empty
        else {
            utils.displayDialogBox("This chest is empty", 2000);
        }
    }
}
