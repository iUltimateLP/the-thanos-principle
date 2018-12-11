/*
    File: main.js
    Description: Main source file for the game
*/

// Create a new level object to fill the grid
let level = new LayeredGrid(6, 6, "mapGridContainer", 2);
level.generate();

for (var x = 0; x < level.getTilesX(); x++) {
    for (var y = 0; y < level.getTilesY(); y++) {
        level.getGrid(0).applyTileset(tilesets.dungeon, x, y, 3, 3);
    }
}

for (var x = 0; x < level.getTilesX(); x++) {
    for (var y = 0; y < level.getTilesY(); y++) {
        level.getGrid(1).applyTileset(tilesets.dungeon, x, y, 2, 3);
    }
}

// Game Loading finished, print a cool stat
console.log("%c It took " + (Date.now() - startTime).toString() + "ms to load the game!", "font-weight: bold;");
