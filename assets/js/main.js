/*
    File: main.js
    Description: Main source file for the game
*/

// Create a new layered grid object which serves as the level
// The x, y and layerCount parameters get overridden by the TiledMapImporter
let level = new LayeredGrid(16, 16, "mapGridContainer", 2);
level.generate();

// Create a new map importer and load the game's main map
let mapImporter = new TiledMapImporter();
mapImporter.loadMap(JSON.stringify(testmap2));
mapImporter.applyMapToGrid(level);

var testSprite = {
    spriteSheet: "assets/img/test.png",
    tileCount: 6,
    tickRate: 32,
    tileWidth: 80,
    tileHeight: 80,
    renderWidth: 64,
    renderHeight: 64,
    renderPixelated: false
}

var thanos = {
    spriteSheet: "assets/img/Thanos2Animation.png",
    tileCount: 9,
    tickRate: 50,
    tileWidth: 32,
    tileHeight: 32,
    renderWidth: 64,
    renderHeight: 64,
    renderPixelated: true
}

let player = new Player({
    spriteTemplate: thanos,
    spriteSheetRight: "assets/img/Thanos2Animation.png",
    spriteSheetLeft: "assets/img/Thanos2AnimationFlip.png",
    spriteSheetUp: "assets/img/Thanos2AnimationBack.png",
    spriteSheetDown: "assets/img/Thanos2AnimationFront.png"
});

player.setPosition(500, 500);

function gameLoop() {
    var playerMovementVector = calculatePlayerMovementVector();
        
    player.addMovementInput(playerMovementVector);

    window.requestAnimationFrame(gameLoop);
}

gameLoop();

// Game Loading finished, print a cool stat
console.log("%c[Main] It took " + (Date.now() - gameStartTime).toString() + "ms to load the game!", "font-weight: bold;");
