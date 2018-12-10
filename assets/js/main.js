/*
    File: main.js
    Description: Main source file for the game
*/

let grid = new Grid(6, 6, "mapGridContainer_layer0");
grid.generate();

let grid2 = new Grid(6, 6, "mapGridContainer_layer1");
grid2.generate();

for (var x = 0; x < grid.getTilesX(); x++) {
    for (var y = 0; y < grid.getTilesY(); y++) {
        grid.applyTileset(tilesets.dungeon, x, y, 3, 3);
    }
}

for (var x = 0; x < grid.getTilesX(); x++) {
    for (var y = 0; y < grid.getTilesY(); y++) {
        grid2.applyTileset(tilesets.dungeon, x, y, 2, 3);
    }
}

console.log("%c It took " + (Date.now() - startTime).toString() + "ms to load the game!", "font-weight: bold;");
