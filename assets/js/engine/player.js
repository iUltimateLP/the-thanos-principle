/*
    File: player.js
    Description: Contains the player actor including movement
*/

const MOVEMENT_SPEED = 5;

function clampMin(val, min) {
    if (val < min) return min;
    else return val;
}

function clamp(val, min, max) {
    if (val < min) return min;
    else if (val > max) return max;
    else return val;
}

class Player {
    constructor(options) {
        this.spriteTemplate = options.spriteTemplate || {};
        this.spriteSheetRight = options.spriteSheetRight || this.spriteTemplate.spriteSheet;
        this.spriteSheetLeft = options.spriteSheetLeft || this.spriteTemplate.spriteSheet;
        this.spriteSheetDown = options.spriteSheetDown || this.spriteTemplate.spriteSheet;
        this.spriteSheetUp = options.spriteSheetUp || this.spriteTemplate.spriteSheet;
        this.isMoving = false;
        this.position = {x: 0, y: 0};
        this.currentForwardVector = {x: 0, y: 0};

        this.createSprite();
    }

    createSprite() {
        this.sprite = new Sprite(this.spriteTemplate);
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;

        this.sprite.getCanvas().style.left = x + "px";
        this.sprite.getCanvas().style.top = y + "px";
    }

    getForwardVector() {
        return this.currentForwardVector;
    }

    hitTest(dist) {
        var testX = (this.position.x + 32) + (this.getForwardVector().x * dist);
        var testY = (this.position.y + 64) + (this.getForwardVector().y * dist);

        var tile = pointToGridCoords(testX, testY);

        var playerTile = pointToGridCoords(this.position.x, this.position.y);
        //level.getGrid(1).highlight(tile.x, tile.y, true);

        var domElements = document.elementsFromPoint(tile.x * 64, tile.y * 64);

        var cells = domElements.filter(elem => elem.classList.contains("map-grid-cell"));

        var collidableCells = cells.filter(elem => elem.hasAttribute("collidable"));

        //console.log("x: " + tile.x + " y: " + tile.y + " num: " + cells.length + " ccells: " + collidableCells.length);

        return collidableCells.length > 0;
    }

    addMovementInput(movementVector) {
        var posX = clamp(this.position.x + movementVector.x * MOVEMENT_SPEED, 0, (level.getTilesX() - 1) * 64);
        var posY = clamp(this.position.y + movementVector.y * MOVEMENT_SPEED, 0, (level.getTilesY() - 1) * 64);

        if (movementVector.x != 0 || movementVector.y != 0) {
            this.currentForwardVector = movementVector;
        }

        if (!this.hitTest(32)) {
            this.setPosition(posX, posY);

            /*setTimeout(function() {
                level.getGrid(1).clearHighlight();
            }, 1000);*/
            
            this.isMoving = true;

            if (movementVector.x > 0) {
                this.sprite.setSpritesheet(this.spriteSheetRight);
            } else if (movementVector.x < 0) {
                this.sprite.setSpritesheet(this.spriteSheetLeft);
            } else if (movementVector.y > 0) {
                this.sprite.setSpritesheet(this.spriteSheetDown);
            } else if (movementVector.y < 0) {
                this.sprite.setSpritesheet(this.spriteSheetUp);
            } else {
                this.isMoving = false;
            }

            // TODO: more sensitive scrolling
            window.scrollTo(posX, posY);
        } else {
            this.isMoving = false;
        }

        if (this.isMoving) {
            this.update();
        } else {
            this.sprite.setFrame(0);
        }
    }

    update() {
        this.sprite.update();
    }
}