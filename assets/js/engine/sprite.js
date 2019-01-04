/*
    File: sprite.js
    Description: Animated sprite objects
*/

class Sprite {
    constructor(options) {
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

        this.createCanvasElement();
        this.setupSprite();
    }

    getCanvas() {
        return this.canvas;
    }

    createCanvasElement() {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("class", "animated-sprite");
        this.canvas.width = this.renderWidth;
        this.canvas.height = this.renderHeight;
        
        this.context = this.canvas.getContext("2d");
        this.context.imageSmoothingEnabled = !this.renderPixelated; // Pixelated look

        //document.getElementById("spriteContainer").appendChild(this.canvas);
        document.body.appendChild(this.canvas);
    }

    setupSprite() {
        this.spriteSheetImage = new Image();
        this.spriteSheetImage.src = this.spriteSheet;
    }

    render() {
        this.context.clearRect(0, 0, 100, 100);

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

    update() {
        this.tickCount += 1;

        if (this.tickCount > (60 - this.tickRate) && this.tickRate > 0) {
            this.tickCount = 0;
            this.currentFrame = (this.currentFrame + 1) % (this.tileCount - 1);
        }

        this.render();
    }

    setSpritesheet(newSpritesheet) {
        this.spriteSheet = newSpritesheet;
        this.setupSprite();
        //this.render();
    }

    setTickRate(newRate) {
        this.tickRate = newRate;
    }

    pauseAnimation() {
        this.prePauseTickRate = this.tickRate;
        this.setTickRate(0);
    }

    resumeAnimation() {
        this.setTickRate(this.prePauseTickRate);
        this.prePauseTickRate = undefined;
    }

    setFrame(frameIndex) {
        /*if (this.tickRate > 0) {
            this.pauseAnimation();
        }*/
        if (this.currentFrame != frameIndex) {
            this.currentFrame = frameIndex;
            this.render();
        }
    }
}
