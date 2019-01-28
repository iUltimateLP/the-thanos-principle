/*
    File: sprite.js
    Description: Animated sprite objects
*/

// Animated sprite object
class Sprite {
    // Constructor taking options to spawn the sprite with
    constructor(options) {
        // Store the input options and make some of them optional
        this.spriteSheet = options.spriteSheet;
        this.tileCount = options.tileCount;
        this.tickRate = options.tickRate || 12;
        this.tileWidth = options.tileWidth || 64;
        this.tileHeight = options.tileHeight || 64;
        this.renderWidth = options.renderWidth || 64;
        this.renderHeight = options.renderHeight || 64;
        this.renderPixelated = options.renderPixelated || false;

        this.currentFrame = 0;
        this.tickCount = 0;
        this.visible = true;

        // Create the canvas for this sprite
        this.createCanvasElement();

        // Create the image object for the sprite sheet
        this.spriteSheetImage = new Image();
        this.spriteSheetImage.src = this.spriteSheet;

        // Assign the load callback to the image (we use .bind(this) to make sure the context is set to this sprite, not the image inside the callback function)
        this.spriteSheetImage.addEventListener("load", this.onImageLoaded.bind(this), false);
    }

    // This callback is called by the spriteSheetImage once it has loaded the resource
    onImageLoaded() {
        // We immediatly render the image because otherwise the sprite would try to draw before the image was actually loaded
        // (loading is an asynchronous call)
        this.render();
    }

    // Getter for the DOM canvas element
    getCanvas() {
        return this.canvas;
    }

    // Creates the canvas for this sprite
    createCanvasElement() {
        // Create a new canvas and set it up for use
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("class", "animated-sprite");
        this.canvas.width = this.renderWidth;
        this.canvas.height = this.renderHeight;
        
        this.context = this.canvas.getContext("2d");
        this.context.imageSmoothingEnabled = !this.renderPixelated; // Pixelated look

        // Add the canvas to the document's body
        document.body.appendChild(this.canvas);
    }

    // Destroys this sprite (a.k.a removes it from screen)
    destroy() {
        this.canvas.remove();
    }

    // Here the magic happens: rendering the sprite
    render() {
        // Clear the context before repainting (not doing this causes it to draw all frames on top of each other)
        this.context.clearRect(0, 0, this.renderWidth, this.renderHeight);

        // Draw the current frame to the 2d context
        this.context.drawImage(
            this.spriteSheetImage,
            this.currentFrame * this.tileWidth,
            0,
            this.tileWidth,
            this.tileHeight,
            0,
            0,
            this.renderWidth,
            this.renderHeight);
    }

    // Update is meant to be called at a tick, basicially ticks the sprite to the next frame
    update() {
        this.tickCount += 1;

        // We do this to be able to adjust the "speed" of the animation by just rendering the image every nth tick
        if (this.tickCount > (60 - this.tickRate) && this.tickRate > 0) {
            this.tickCount = 0;
            this.currentFrame = (this.currentFrame + 1) % (this.tileCount - 1);
        }

        this.render();
    }
    
    // Checks if a sprite is visible
    isVisible() {
        return this.visible;
    }

    // Hides this sprite
    hide() {
        this.canvas.style.display = "none";
        this.visible = false;
    }

    // Shows this sprite
    show() {
        this.canvas.style.display = "block";
        this.visible = true;
    }

    // Sets a new spritesheet
    setSpritesheet(newSpritesheet) {
        this.spriteSheet = newSpritesheet;
        
        this.spriteSheetImage = new Image();
        this.spriteSheetImage.src = this.spriteSheet;
        this.spriteSheetImage.addEventListener("load", this.onImageLoaded.bind(this), false);
    }

    // Sets a new tick speed
    setTickRate(newRate) {
        this.tickRate = newRate;
    }

    // Pauses the animation
    pauseAnimation() {
        this.prePauseTickRate = this.tickRate;
        this.setTickRate(0);
    }

    // Resumes the animation
    resumeAnimation() {
        this.setTickRate(this.prePauseTickRate);
        this.prePauseTickRate = undefined;
    }

    // Sets the frame to a specific frame
    setFrame(frameIndex) {
        if (this.currentFrame != frameIndex) {
            this.currentFrame = frameIndex;
            this.render();
        }
    }
}
