/*
    File: object.js
    Description: Interactable object subsystem for items on the map
*/

/*
Object template:
    {
        "sprite": {
            ...
        },
        "interactable": true/false,
        "name": string,
        "renderLayer": int,
        "animated": true/false,
        "onInteract": fn
    }
*/

// This is a global object store
var __objects = [];

// Find the game object instance based on the DOM canvas
function findObjectForCanvas(canvas) {
    var foundCanvas = undefined;

    __objects.forEach(function(element) {
        if (element.canvas == canvas) {
            foundCanvas = element.object;
        }
    });

    return foundCanvas;
}

// A game object is an interactable sprite
class GameObject {
    // Constructor taking a object template (see above) and coordinates
    constructor(template, x, y) {
        this.template = template || {};
        this.interactable = this.template.interactable;
        this.interactionSound = this.template.interactionSound || -1;
        this.position = {x: x, y: y};
        this.collidable = (this.template.collidable == undefined ? true : this.template.collidable);
        this.overlappable = (this.template.overlappable == undefined ? false : this.template.overlappable);

        // Create the sprite
        this.sprite = new Sprite(this.template.sprite);
        this.sprite.getCanvas().style.zIndex = this.template.renderLayer || 1;

        // Apply the sprite's position
        this.sprite.getCanvas().style.left = this.position.x + "px";
        this.sprite.getCanvas().style.top = this.position.y + "px";

        // Push the object to the global store
        __objects.push({canvas: this.sprite.getCanvas(), object: this, position: this.position});

        // Start the tick (rendering the sprite)
        this.tick();
    }

    // Sets whether this object should be interactable or not
    setInteractable(isInteractable) {
        this.interactable = isInteractable;
    }

    // Sets whether this object should be overlappable or not
    setOverlappable(isOverlappable) {
        this.overlappable = isOverlappable;
    }

    // Removes the object from screen and the store
    remove() {
        __objects = __objects.filter(obj => obj.object != this);
        this.sprite.destroy();
    }

    // Returns the object's position
    getPosition() {
        return this.position;
    }

    // Returns the object's size
    getSize() {
        return {width: this.sprite.renderWidth, height: this.sprite.renderHeight};
    }

    // Updates the object (for now only updates the sprite)
    update() {
        this.sprite.update();
    }

    // If the animated flag is set, this will periodically call update();
    tick() {
        if (this.template.animated) {
            this.update();

            window.requestAnimationFrame(this.tick.bind(this));
        }
    }

    // Returns if this object is interactable
    isInteractable() {
        return this.interactable;
    }

    // Sets the sound for interaction
    setInteractionSound(newSound) {
        this.interactionSound = newSound;
    }

    // Interacts with this object by calling the onInteract callback
    interact() {
        if (this.template.onInteract && this.isInteractable()) {
            this.template.onInteract();
            if (this.interactionSound) {
                audioSystem.playSound(this.interactionSound);
            }
        } else {
            console.log("%c[Object] Object has no interact callback set", "font-weight: bold;");
        }
    }

    // Starts overlapping (called by player most likely)
    startOverlap() {
        if (this.template.onStartOverlap && !this.collidable && this.overlappable) {
            this.template.onStartOverlap();

            if (this.interactionSound) {
                audioSystem.playSound(this.interactionSound);
            }
        }
    }

    // Stops overlapping
    stopOverlap() {
        if (this.template.onEndOverlap && !this.collidable && this.overlappable) {
            this.template.onEndOverlap();
        }
    }
}