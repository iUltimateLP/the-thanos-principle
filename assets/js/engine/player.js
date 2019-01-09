/*
    File: player.js
    Description: Contains the player actor including movement
*/

// Constants
const MOVEMENT_SPEED = 5;
const HITTEST_DIST = 32;
const PLAYER_LAYER = 2;

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

        // Create the sprite object using the sprite template
        this.sprite = new Sprite(this.spriteTemplate);
        this.sprite.getCanvas().style.zIndex = PLAYER_LAYER;
    }

    // Sets the player position to a given coordinate
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;

        this.sprite.getCanvas().style.left = x + "px";
        this.sprite.getCanvas().style.top = y + "px";
    }

    // Forward vector getter function
    getForwardVector() {
        return this.currentForwardVector;
    }

    // Returns true if an collidable object was found in front of the player
    hitTest() {
        // Calculate the absolute screen position to test for collision
        var testX = (this.position.x + 32) + (this.getForwardVector().x * HITTEST_DIST);
        var testY = (this.position.y + 64) + (this.getForwardVector().y * HITTEST_DIST / 2); // Dividing the distance by 2 on the y axis looks better

        // Convert the screen coordinates to grid coordinates
        var tile = screenPositionToGridPosition(testX, testY);

        // Get all DOM elements at the position to test (we convert tile coordinates to screen coordinates again by multiplying with the grid size)
        var domElements = document.elementsFromPoint(tile.x * 64, tile.y * 64);

        // Filter out elements which are no cells
        var cells = domElements.filter(elem => elem.classList.contains("map-grid-cell"));

        // Filter out non-collidable cells
        var collidableCells = cells.filter(elem => elem.hasAttribute("collidable"));

        //console.log("x: " + tile.x + " y: " + tile.y + " num: " + cells.length + " ccells: " + collidableCells.length);

        // If there is at least one collidable cell, we have something in front of us
        return collidableCells.length > 0;
    }

    // Adds movement to the player using a movement vector (use this in a loop for smooth movement)
    addMovementInput(movementVector) {
        // Calculate the new position by adding the the movement vector components to our current position
        // We clamp this to 0..levelSize*gridSize to make sure the player won't move out of the map bounds
        var posX = clamp(this.position.x + movementVector.x * MOVEMENT_SPEED, 0, (level.getTilesX() - 1) * 64);
        var posY = clamp(this.position.y + movementVector.y * MOVEMENT_SPEED, 0, (level.getTilesY() - 1) * 64);

        // If any component of the movement vector is non-zero, set this to the players new movement vector
        if (movementVector.x != 0 || movementVector.y != 0) {
            this.currentForwardVector = movementVector;
        }

        // Perform a hit test to prevent the player to go through walls
        if (!this.hitTest()) {
            // Update the position
            this.setPosition(posX, posY);

            /*setTimeout(function() {
                level.getGrid(1).clearHighlight();
            }, 1000);*/
            
            // Set a moving flag (is true as long the player holds down a movement key)
            this.isMoving = true;

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
                this.isMoving = false;
            }

            // Scroll the camera
            // TODO: more sensitive scrolling
            window.scrollTo(posX, posY);
        } else {
            this.isMoving = false;
        }

        // If the moving flag is set, update the sprite, otherwise just set it to the first frame (standing)
        if (this.isMoving) {
            this.sprite.update();
        } else {
            this.sprite.setFrame(0);
        }
    }
}