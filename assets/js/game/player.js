/*
    File: player.js
    Description: Contains the player actor including movement
*/

// Hittest enum
const HITTEST_NONE = 0;
const HITTEST_TILE = 1;
const HITTEST_OBJECT = 2;

// Constants
const MOVEMENT_SPEED = 5;
const HITTEST_DIST = 32;
const PLAYER_LAYER = 15;

// A player is a animated sprite which has movement capabilities
class Player {
    constructor(options) {
        // Initialize member variables
        this.spriteTemplate = options.spriteTemplate || {};
        this.spriteSheetRight = options.spriteSheetRight || this.spriteTemplate.spriteSheet;
        this.spriteSheetLeft = options.spriteSheetLeft || this.spriteTemplate.spriteSheet;
        this.spriteSheetDown = options.spriteSheetDown || this.spriteTemplate.spriteSheet;
        this.spriteSheetUp = options.spriteSheetUp || this.spriteTemplate.spriteSheet;
        this.isMoving = false;
        this.position = {x: 0, y: 0};
        this.currentForwardVector = {x: 0, y: 0};
        this.inventory = new Inventory();
        this.inventory.onInventoryUpdated = this.onPlayerInventoryUpdated.bind(this);

        // Create the sprite object using the sprite template
        this.sprite = new Sprite(this.spriteTemplate);
        this.sprite.getCanvas().style.zIndex = PLAYER_LAYER;

        // Start the input loop
        this.inputLoop();
    }

    // Sets the player position to a given coordinate
    setPosition(x, y) {
        if (this.position.x != x || this.position.y != y) {
            this.position.x = x;
            this.position.y = y;

            this.sprite.getCanvas().style.left = x + "px";
            this.sprite.getCanvas().style.top = y + "px";
        }
              
        // Scroll the camera
        this.scrollCamera();
    }

    // Forward vector getter function
    getForwardVector() {
        return this.currentForwardVector;
    }

    // Returns a hit test result {didHit: true/false, (type: "tile"/"object"), (objects: [])}
    getObjectInFront() {
        // Calculate the absolute screen position to test for collision
        var testX = (this.position.x + 32) + (this.getForwardVector().x * HITTEST_DIST);
        var testY = (this.position.y + 64) + (this.getForwardVector().y * HITTEST_DIST / 2); // Dividing the distance by 2 on the y axis looks better

        // Convert the screen coordinates to grid coordinates
        var tile = utils.screenPositionToGridPosition(testX, testY);

        // Get the client rectangle (contains scroll offset)
        var clientRect = document.body.getClientRects()[0];

        // Get all DOM elements at the position to test (we convert tile coordinates to screen coordinates again by multiplying with the grid size and adding the screen offset)
        var domElements = document.elementsFromPoint((tile.x * 64) + clientRect.x, (tile.y * 64) + clientRect.y);

        /// Tiles
        // OLD COLLISION SYSTEM: Filter out elements which are no cells
        //var cells = domElements.filter(elem => elem.classList.contains("map-grid-cell"));

        // OLD COLLISION SYSTEM: Filter out non-collidable cells
        // var collidableCells = cells.filter(elem => elem.hasAttribute("collidable"));

        /// Objects
        // Filter out elements which are no objects and ourselves
        var objects = domElements.filter(elem => elem.getAttribute("class") === "animated-sprite" && elem != this.sprite.getCanvas());

        // New collision system:
        /*
            Player sprite:
            x----+ 
            | #  | 
            +----+
            x = this.position 
            # = sprite origin offset (28, 32)
        */
        // We calculate a absolute point where we want to center around an imaginary rectangle by taking the player's sprite position, adding an offset to it,
        // and add the scaled forward vector to it
        var testX2 = this.position.x + 28 + (this.getForwardVector().x * 16);
        var testY2 = this.position.y + 32 + (this.getForwardVector().y * 8);

        // This checks if a rectangle which has it's top-left point at textX2, testY2 and a size of 16x16 overlaps with the "collision mesh"
        var isColliding = mapImporter.rectangleOverlapsCollisionMesh(testX2, testY2, 16, 16);

        // If we did hit the collision mesh and no object, we have something in front of us
        if (isColliding && objects.length == 0) { 
            return {didHit: true, type: "tile"};
        }
        // Otherwise check for objects. This prioritizes objects over tiles
        else if (objects.length > 0) {
            return {didHit: true, type: "object", objects: objects};
        } 
        // We didn't hit anything
        else {
            return {didHit: false};
        }
    }

    // Performs the camera scrolling
    scrollCamera() {
        // Calculate the (screen size) center of the screen
        var center = {x: window.innerWidth / 2, y: window.innerHeight / 2};

        // The scroll position centers around the player
        var scrollX = this.position.x - center.x;
        var scrollY = this.position.y - center.y;

        // Use JS' native scroll API
        window.scrollTo(scrollX, scrollY);
    }

    // If a current object is targeted, interact with it
    interactWithObject() {
        if (this.currentObject) {
            this.currentObject.interact();
        }
    }

    // Returns the player's inventory component
    getInventory() {
        return this.inventory;
    }

    // Called when the player inventory updates
    onPlayerInventoryUpdated() {
        // Remove all item images
        document.getElementById("inventory-item-1").style = "";
        document.getElementById("inventory-item-2").style = "";

        // Iterate through the inventory items and set them natively
        for (var i = 0; i < this.inventory.getItems().length; i++) {
            var uiCellNum = 2 - i;
            document.getElementById("inventory-item-" + uiCellNum).style = "background-image: url(\"" + this.inventory.getItems()[i].image + "\");";
        }
    }

    // Not the best solution, but for the laser puzzle, we check if the player overlaps with the laser hit boxes
    checkLaserHit() {
        if (lasers.length > 0) {
            for (var i = 0; i < lasers.length; i++) {
                var laser = lasers[i];

                if (utils.isRectangleOverlapping(laser.x, laser.y, laser.w, laser.h, this.position.x, this.position.y, 64, 64)) {
                    laser.onStartOverlap();
                }
            }
        }
    }

    // This does the internal work of moving the player
    move(posX, posY, movementVector) {
        // Update the position
        this.setPosition(posX, posY);

        if ((movementVector.x != 0 || movementVector.y != 0) && !this.isMoving) {
            // Set a moving flag (is true as long the player holds down a movement key)
            this.isMoving = true;

            // Make sure we don't get doubled footstep sounds
            if (!this.footstepSound) {
                this.footstepSound = audioSystem.playSound(sounds.footsteps, true);
            }
        }

        // Update the sprite sheet to their respective directions
        if (movementVector.x > 0) {
            this.sprite.setSpritesheet(this.spriteSheetRight);
        } else if (movementVector.x < 0) {
            this.sprite.setSpritesheet(this.spriteSheetLeft);
        } else if (movementVector.y > 0) {
            this.sprite.setSpritesheet(this.spriteSheetDown);
        } else if (movementVector.y < 0) {
            this.sprite.setSpritesheet(this.spriteSheetUp);
        } else {
            // Here the vector is 0,0 so set isMoving to false again
            this.stopMoving();
        }
    }

    // Does internal work for stopping the players movement
    stopMoving() {
        this.isMoving = false;

        if (this.footstepSound) {
            this.footstepSound.stop();
            this.footstepSound = undefined;
        }
    }

    // Adds movement to the player using a movement vector (use this in a loop for smooth movement)
    addMovementInput(movementVector) {
        // Calculate the new position by adding the the movement vector components to our current position
        // We clamp this to 0..levelSize*gridSize to make sure the player won't move out of the map bounds
        var posX = utils.clamp(this.position.x + movementVector.x * MOVEMENT_SPEED, 0, (level.getTilesX() - 1) * 64);
        var posY = utils.clamp(this.position.y + movementVector.y * MOVEMENT_SPEED, 0, (level.getTilesY() - 1) * 64);

        // If any component of the movement vector is non-zero, set this to the players new movement vector
        if (movementVector.x != 0 || movementVector.y != 0) {
            this.currentForwardVector = movementVector;
        }

        // Perform a hit test to prevent the player to go through walls
        var hitResult = this.getObjectInFront();

        // Didn't hit anything
        if ((!hitResult.didHit && hitResult.type === undefined)) {
            // Move the player to the new position
            this.move(posX, posY, movementVector);

            // Reset the current object and interaction tooltip because there is no object in sight
            if (this.currentObject) {
                if (this.didStartOverlap) {
                    this.currentObject.stopOverlap();
                    this.didStartOverlap = false;
                }
                this.currentObject = undefined;
                
                utils.setInteractionTooltipState(false);
            }
        } 
        // We did hit an object
        else if (hitResult.didHit && hitResult.type === "object") {
            // Since we only hit the canvases but not the actual JS object reference, look it up in the canvas/object store
            var object; // = findObjectForCanvas(hitResult.objects[0]);
            
            hitResult.objects.forEach(function(obj) {
                if (findObjectForCanvas(obj).isInteractable()) {
                    object = findObjectForCanvas(obj);
                }
            });

            if (!object) {
                object = findObjectForCanvas(hitResult.objects[0]);
            }

            // If the object isn't collidable, allow to move
            if (!object.collidable) {
                // Move
                this.move(posX, posY, movementVector);
                
                if (!this.didStartOverlap) {
                    // Notify the object that we just overlapped it
                    object.startOverlap();
                    this.didStartOverlap = true;
                }
            }

            // If the current object isn't already this object, set it (makes sure we execute this only once
            if (this.currentObject != object) {
                this.currentObject = object;

                // If the object is interactable, show the tooltip and adjust it's position
                if (this.currentObject.isInteractable()) {
                    utils.setInteractionTooltipState(true, this.currentObject.getPosition().x + this.currentObject.getSize().width / 4, this.currentObject.getPosition().y - 32);
                }
            }

            // Stop moving
            this.stopMoving();
        } 
        // We did hit a tile 
        else {
            // Remove the current object from our cache, hide the tooltip, and stop moving
            if (this.currentObject) {
                if (this.didStartOverlap) {
                    this.currentObject.stopOverlap();
                    this.didStartOverlap = false;
                }
                this.currentObject = undefined;
                
                utils.setInteractionTooltipState(false);
            }

            // Stop moving
            this.stopMoving();
        }

        // Check if we got hit by lasers
        this.checkLaserHit();

        // If the moving flag is set, update the sprite, otherwise just set it to the first frame (standing)
        if (this.isMoving) {
            this.sprite.update();
        } else {
            this.sprite.setFrame(0);
        }
    }

    // This is the player input loop, we update it using window.requestAnimationFrame() because it's smooth and non thread-blocking
    inputLoop() {
        // Add the movement based on the current movement vector
        this.addMovementInput(calculatePlayerMovementVector());

        // Request a new frame for the loop (.bind(this) for keeping the context again)
        window.requestAnimationFrame(this.inputLoop.bind(this));
    }
}
