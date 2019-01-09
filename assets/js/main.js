/*
    File: main.js
    Description: Main source file for the game
*/

// Create a new map importer and load the game's main map
let mapImporter = new TiledMapImporter();
mapImporter.loadMap(JSON.stringify(testmap2));

// Create a new layered grid object which serves as the level
// The x and y parameters get overridden by the TiledMapImporter
let level = new LayeredGrid(16, 16, "mapGridContainer", mapImporter.getLayerCount());
level.generate();

// Applies the map imported to the grid
mapImporter.applyMapToGrid(level);

var thanos = {
    spriteSheet: "assets/img/character/thanos_right.png",
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
    spriteSheetRight: "assets/img/character/thanos_right.png",
    spriteSheetLeft: "assets/img/character/thanos_left.png",
    spriteSheetUp: "assets/img/character/thanos_back.png",
    spriteSheetDown: "assets/img/character/thanos_front.png"
});

player.setPosition(500, 500);

var lastTime = Date.now();

function gameLoop() {
    var delta = Date.now();

    var playerMovementVector = calculatePlayerMovementVector();
        
    player.addMovementInput(playerMovementVector);

    window.requestAnimationFrame(gameLoop);
}

gameLoop();

// Game Loading finished, print a cool stat
console.log("%c[Main] It took " + (Date.now() - gameStartTime).toString() + "ms to load the game!", "font-weight: bold;");
