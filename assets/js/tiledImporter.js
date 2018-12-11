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

class TiledMapImporter {
    constructor() {
        this.rawMapData = {};
    }

    loadMap(jsonData) {
        try { 
            this.rawMapData = JSON.parse(jsonData);
        } catch(e) { 
            console.error("[Tiled Map Importer] Error parsing map JSON data!");
        }
    }

    tiledIndexToCoordinates(index) {
        var x = Math.floor(index / 16);
        var y = index - (Math.floor(index / 16) * 16);

        return {x: y, y: x};
    }

    applyMapToGrid(layeredGridTarget) {
        var layers = this.rawMapData.layers;

        console.log("%c[Tiled Map Importer] Loading map with " + layers.length + " layers and a map size of " + 
            this.rawMapData.width + "x" + this.rawMapData.height + " tiles.", "font-weight: bold;");

        layeredGridTarget.setSize(this.rawMapData.width, this.rawMapData.height);

        for (var currentLayerIdx = 0; currentLayerIdx < layers.length; currentLayerIdx++) {
            var layer = layers[currentLayerIdx];
            
            for (var currentTileIdx = 0; currentTileIdx < layer.data.length; currentTileIdx++) {
                var tilesetCoords = this.tiledIndexToCoordinates(layer.data[currentTileIdx]);
                var tileCoords = this.tiledIndexToCoordinates(currentTileIdx);

                layeredGridTarget.getGrid(currentLayerIdx).applyTileset(tilesets.dungeon, tileCoords.x, tileCoords.y, tilesetCoords.x, tilesetCoords.y);
            }
        }

        console.log("%c[Tiled Map Importer] Map loaded!", "font-weight: bold;");
    }
}
