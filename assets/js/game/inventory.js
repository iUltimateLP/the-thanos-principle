/*
    File: inventory.js
    Description: Supplies an inventory component which can hold items and interact with them
*/

/*
Item structure: 
{
    "name": string,
    "image": string,
    "friendlyName": string
}
*/

// Inventory component which can contain different items
class Inventory {
    // Empty constructor to initialize some variables
    constructor() {
        this.items = [];
        this.onInventoryUpdated = function() {};
    }

    // Adds a new item to the inventory
    addItem(newItem) {
        this.items.push(newItem);
        this.onInventoryUpdated();
        console.log("%c[Inventory] Added item '" + newItem.name + "' to inventory", "font-weight: bold;");
    }

    // Removes an item by name
    removeItemByName(itemName) {
        // Filters out the item which has the exact name, all others pass the predicate
        this.items = this.items.filter(item => item.name != itemName);
        this.onInventoryUpdated();
        console.log("%c[Inventory] Removed item '" + itemName + "' from inventory", "font-weight: bold;");
    }

    // Returns an item by name
    getItemByName(itemName) {
        return this.items.filter(item => item.name == itemName)[0];
    }

    // Returns all items in this inventory
    getItems() {
        return this.items;
    }

    // Checks if the inventory has a certain item
    hasItem(itemName) {
        return this.getItemByName(itemName) != undefined;
    }

    // Moves an item from this inventory to another inventory
    transactItem(itemName, otherInventory) {
        otherInventory.addItem(this.getItemByName(itemName));
        this.removeItemByName(itemName);

        console.log("%c[Inventory] Transacted item '" + itemName + "'", "font-weight: bold;");
    }
}
