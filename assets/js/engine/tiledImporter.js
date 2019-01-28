/*
    File: tiledImporter.js
    Description: System to import maps from the Tiled Map Editor to our grid system
*/

/*
Tiled Map Format
{
    "tiledversion": "1.2.1",
    "height": 16,
    "width": 16,
    "layers": [
        {
            "height": 16,
            "width": 16,
            "name": "Ebenenname 1",
            "visible": true,
            "id": 1,
            "data": [0, 0, 0, 0, 51, 51, 51, 51, ...]
        },
        ...
    ]
}

data ist ein Array aus indices der tiles im tileset, also bei einem 8x8 tileset
0  1  2  3  4  5  6  7
8  9  10 11 12 13 14 15
16 17 18 19 20 21 22 23
24 25 26 27 28 29 30 31...

! 1 shifted weil 0 transparent / kein Tile ist

=> x = round((i-1) / xTiles)
=> y = i - (round((i-1) / xTiles) * xTiles)
*/

// Class for importing maps from Tiled to our grid system
class TiledMapImporter {
    // We don't need to pass any variables at construction
    constructor() {
        this.rawMapData = {};
    }

    // Initiates the map load from the Tiled .json map format
    loadMap(jsonData) {
        // Try to parse the JSON data into an object
        try { 
            this.rawMapData = JSON.parse(jsonData);
        } catch(e) { 
            console.error("[Tiled Map Importer] Error parsing map JSON data!");
        }
    }

    // Tiled uses a simple int array for storing the tiles on a tileset, this functions converts a index into x and y coordinates
    tiledIndexToCoordinates(index) {
        // 16 is the tileset width and height, hardcoded for now
        var x = Math.floor(index / 16);
        var y = index - (Math.floor(index / 16) * 16);

        // Swap y and x, because Tiled does it like that
        return {x: y, y: x};
    }
    
    // When having multiple tilesets, Tiled defines a start GID for tilesets. This function reverse-searches the tileset from a given GID
    findTilesetForTileID(tileID) {
        var targetTilesetName = "dungeon";
        var targetTileset;
        var targetFirstGid = 0;

        // Go through every tileset stored in the map
        for (var i = 0; i < this.rawMapData.tilesets.length; i++) {
            var currentTileset = this.rawMapData.tilesets[i];
            var nextTileset = this.rawMapData.tilesets[i+1];

            // Is the tile ID in currentGid..nextGid
            if (tileID >= currentTileset.firstgid && nextTileset && tileID < nextTileset.firstgid) {
                targetTilesetName = currentTileset.tilesetName;
                targetFirstGid = currentTileset.firstgid - 1;
            }
            // This happens if there is no next tileset (=> it's the last one)
            else if (tileID >= currentTileset.firstgid && !nextTileset) {
                targetTilesetName = currentTileset.tilesetName;
                targetFirstGid = currentTileset.firstgid - 1;
            }
        }

        // Then get the tileset object by name we searched earlier
        tilesets.forEach(function(tileset) {
            if (tileset.name === targetTilesetName) {
                targetTileset = tileset;
            }
        });

        return {tileset: targetTileset, firstgid: targetFirstGid};
    }

    // Checks if a layer contains null data only => is empty
    isLayerEmpty(layer) {
        var result = true;
        layer.data.forEach(function(data) {
            if (data != 0) {
                result = false;
            }
        });

        return result;
    }

    // Returns the layer count
    getLayerCount() {
        return this.rawMapData.layers.length;
    }

    // Returns the count of tile layers only
    getTileLayerCount() {
        var tileLayers = this.rawMapData.layers.filter(layer => layer.type === "tilelayer" && !this.isLayerEmpty(layer));
        return tileLayers.length;
    }

    // Returns an object layer with a specified name
    getObjectLayer(name) {
        var matchingLayers = this.rawMapData.layers.filter(layer => layer.type === "objectgroup" && layer.name === name);

        // Assume there is just one layer per name
        return matchingLayers[0];
    }

    // Returns all object layers
    getObjectLayers() {
        return this.rawMapData.layers.filter(layer => layer.type === "objectgroup");
    }

    // Finds the __SPAWNPOINT object layer in the map which I used for marking the spawnpoint
    findSpawnpoint() {
        var spawnpointLayer = this.getObjectLayer("__SPAWNPOINT");
        
        // Multiply the coordinates by 4 because, ...well it works?
        return {x: spawnpointLayer.objects[0].x * 4, y: spawnpointLayer.objects[0].y * 4}
    }

    // Gets the collision mesh rectangles
    getCollisionMeshRects() {
        var collsionLayer = this.getObjectLayer("__COLLISION");

        return collsionLayer.objects;
    }

    // Checks if a rectangle overlaps the collision mesh
    rectangleOverlapsCollisionMesh(x, y, w, h) {
        var collsionRects = this.getCollisionMeshRects();

        var doesCollide = false;

        for (var i = 0; i < collsionRects.length; i++) {
            var rect = collsionRects[i];
            doesCollide = utils.isRectangleOverlapping(x, y, w, h, rect.x*4, rect.y*4, rect.width*4, rect.height*4);
            if (doesCollide) {
                break;
            }
        }

        return doesCollide;
    }

    // Here the magic happens: applying the tiled map to our grid system
    applyMapToGrid(layeredGridTarget) {
        // We only want to populate tile layers only, so filter everything else
        var tileLayers = this.rawMapData.layers.filter(layer => layer.type === "tilelayer" && !this.isLayerEmpty(layer));

        console.log("%c[Tiled Map Importer] Loading map with " + tileLayers.length + " tile layers and a map size of " + 
            this.rawMapData.width + "x" + this.rawMapData.height + " tiles.", "font-weight: bold;");

        // Set the size of the map grid to the size of the Tiled map
        layeredGridTarget.setSize(this.rawMapData.width, this.rawMapData.height);

        // Iterate through each layer
        for (var currentLayerIdx = 0; currentLayerIdx < tileLayers.length; currentLayerIdx++) {
            var layer = tileLayers[currentLayerIdx];
            
            // Iterate through each tile of the layer
            for (var currentTileIdx = 0; currentTileIdx < layer.data.length; currentTileIdx++) {
                // Find the tileset of the current tile
                var targetTileset = this.findTilesetForTileID(layer.data[currentTileIdx]);

                // Adjust the index by the gid offset of the current tileset
                var adjustedTile = layer.data[currentTileIdx] - targetTileset.firstgid;
                
                // Calculate the coordinates on the tileset
                var tilesetCoords = this.tiledIndexToCoordinates(adjustedTile);
                var tileCoords = {x: 0, y: 0};//this.tiledIndexToCoordinates(currentTileIdx);

                // Calculate the coordinates the tile should have in real world
                tileCoords.y = Math.floor(currentTileIdx / 50);
                tileCoords.x = currentTileIdx - (Math.floor(currentTileIdx / 50) * 50);

                // OLD COLLISION SYSTE
                // Check if this tile should be collidable by getting the "collidable" property of the current layer
                //var isCollidable = layer.data[currentTileIdx] > 0 && utils.getLayerProperty(layer, "collidable"); //(currentLayerIdx == 1) && layer.data[currentTileIdx] > 0;

                // Apply the tile on the specified position
                layeredGridTarget.getGrid(currentLayerIdx).applyTileset(targetTileset.tileset, tileCoords.x, tileCoords.y, tilesetCoords.x, tilesetCoords.y, false);
            }
        }

        // We did it!
        console.log("%c[Tiled Map Importer] Map loaded!", "font-weight: bold;");
    }
}
