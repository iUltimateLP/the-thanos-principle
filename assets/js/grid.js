/*
    File: grid.js
    Description: Grid system
*/

class Grid {
    constructor(tilesX, tilesY, mapContainerID) {
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        this.mapContainerID = mapContainerID;
        this.cells = [];
    }

    getTilesX() {
        return this.tilesX;
    }

    getTilesY() {
        return this.tilesY;
    }

    getMapContainer() {
        return document.getElementById(this.mapContainerID);
    }

    applyTileset(tileset, targetX, targetY, tileX, tileY) {
        var bgSizePx = (tileset.xTiles * tileset.pixelsPerTile * 4);

        var backgroundSizeStr = "background-size: " + bgSizePx + "px;";
        var backgroundImageStr = "background-image: url(\"" + tileset.fileName + "\");";
        var backgroundPositionXStr = "background-position-x: " + (((tileX / tileset.xTiles) * bgSizePx) - (tileset.pixelsPerTile * 4)) * -1 + "px;";
        var backgroundPositionYStr = "background-position-y: " + ((((tileY / tileset.yTiles) * bgSizePx) - (tileset.pixelsPerTile * 4)) * -1 - 64) +  "px;";

        var styleString = backgroundSizeStr + " " + backgroundImageStr + " " + backgroundPositionXStr + " " + backgroundPositionYStr;
        this.cells[targetY][targetX].style = styleString;
    }

    createCell(x, y) {
        var div = document.createElement("div");
        div.setAttribute("class", "map-grid-cell tileset " + (gameConfig.debugMode ? "debug" : ""));
        div.setAttribute("style", "height: " + gameConfig.gridTileSize + "px; ");

        if (gameConfig.debugMode) {
            var p = document.createElement("p");
            p.appendChild(document.createTextNode(x + "," + y));
            p.setAttribute("class", "map-grid-cell-label");
            div.appendChild(p);
        }

        return div;
    }

    setVisibility(state) {
        this.getMapContainer().style.display = state ? "grid" : "none";
    }

    generate() {
        this.getMapContainer().setAttribute("style", "grid-template-columns: repeat(" + this.tilesX + ", 64px);")

        this.cells = [];

        for (var y = 0; y < this.tilesY; y++) {
            var cellsY = [];
            for (var x = 0; x < this.tilesX; x++) {
                var cell = this.createCell(x, y);

                cellsY.push(cell);

                this.getMapContainer().appendChild(cell);
            }
            this.cells.push(cellsY);
        }
    }
}

class LayeredGrid {
    constructor(tilesX, tilesY, mapContainerBaseID, layerCount) {
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        this.mapContainerBaseID = mapContainerBaseID;
        this.layerCount = layerCount;
        this.layers = [];
    }

    getMapContainerName(layer) {
        return this.mapContainerBaseID + "_layer" + layer;
    }

    getLayerContainer(layer) {
        return document.getElementById(this.getMapContainerName(layer));
    }

    getTilesX() {
        return this.tilesX;
    }

    getTilesY() {
        return this.tilesY;
    }

    generate() {
        for (var layer = 0; layer < this.layerCount; layer++) {
            let grid = new Grid(this.tilesX, this.tilesY, this.getMapContainerName(layer));
            console.log("#" + this.getMapContainerName(layer));
            grid.generate();
            this.layers.push(grid);
        }
    }

    getGrid(layer) {
        return this.layers[layer];
    }

    setLayerVisibility(layer, visibile) {
        this.layers[layer].setVisibility(visibile);
    }
}
