/*
    File: main.js
    Description: Main script, loaded last, initializes the base components of the game
*/

// Create a new map importer and load the game's main map
let mapImporter = new TiledMapImporter();
mapImporter.loadMap(JSON.stringify(mainmap));

// Create a new layered grid object which serves as the level
// The x and y parameters get overridden by the TiledMapImporter
let level = new LayeredGrid(16, 16, mapImporter.getTileLayerCount());
level.generate();

// Applies the map imported to the grid
mapImporter.applyMapToGrid(level);

// Create a new Thanos spritesheet instance
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

// Create the new player (global, is used on a variety of different scripts too)
let player = new Player({
    spriteTemplate: thanos,
    spriteSheetRight: "assets/img/character/thanos_right.png",
    spriteSheetLeft: "assets/img/character/thanos_left.png",
    spriteSheetUp: "assets/img/character/thanos_back.png",
    spriteSheetDown: "assets/img/character/thanos_front.png"
});

// Determine the player's spawn point, and set the players position accordingly
var spawnPoint = mapImporter.findSpawnpoint();
player.setPosition(spawnPoint.x, spawnPoint.y);

// Populate all the game objects
populateLevelObjects();

// Game Loading finished, print a cool stat
console.log("%c[Main] It took " + (Date.now() - gameStartTime).toString() + "ms to load the game!", "font-weight: bold;");
