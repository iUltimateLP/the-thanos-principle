/*
    File: grid.js
    Description: Grid system
*/

// Represents a grid in the engine, can have x*y tiles
class Grid {
    // Constructor
    constructor(tilesX, tilesY, mapContainerID) {
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        this.mapContainerID = mapContainerID;
        this.cells = [];
    }

    // Returns tile count in X dimension
    getTilesX() {
        return this.tilesX;
    }

    // Returns tile count in Y dimension
    getTilesY() {
        return this.tilesY;
    }

    // Returns the DOM element this grid is rendered on
    getMapContainer() {
        return document.getElementById(this.mapContainerID);
    }

    // Applies a tileset tile to a specified position
    applyTileset(tileset, targetX, targetY, tileX, tileY, collidable) {
        // Weird conversion for CSS' background size in pixels, 4 is our upscaling factor
        var bgSizePx = (tileset.xTiles * tileset.pixelsPerTile * 4);

        // Format the strings for CSS (note: you won't understand this - it took me at least three hours to figure out)
        var backgroundSizeStr = "background-size: " + bgSizePx + "px;";
        var backgroundImageStr = "background-image: url(\"" + tileset.fileName + "\");";
        var backgroundPositionXStr = "background-position-x: " + (((tileX / tileset.xTiles) * bgSizePx) - (tileset.pixelsPerTile * 4)) * -1 + "px;";
        var backgroundPositionYStr = "background-position-y: " + ((((tileY / tileset.yTiles) * bgSizePx) - (tileset.pixelsPerTile * 4)) * -1 - 64) +  "px;";

        // Create a nice style string out of it and apply it to the cell
        var styleString = backgroundSizeStr + " " + backgroundImageStr + " " + backgroundPositionXStr + " " + backgroundPositionYStr;
        //console.log("targetX " + targetX + " targetY " + targetY);
        this.cells[targetY][targetX].style = styleString;

        // If the cell should be collidable, set an attirbute for later hit testing
        if (collidable) {
            this.cells[targetY][targetX].setAttribute("collidable", true);
        }
    }

    // Creates a cell at a given position (internal use only!)
    createCell(x, y) {
        // Create the root div element and apply class and style attributes
        var div = document.createElement("div");
        div.setAttribute("class", "map-grid-cell tileset " + (gameConfig.debugMode ? "debug" : ""));
        div.setAttribute("style", "height: " + gameConfig.gridTileSize + "px; ");

        // Debug
        if (gameConfig.debugMode) {
            var p = document.createElement("p");
            p.appendChild(document.createTextNode(x + "," + y));
            p.setAttribute("class", "map-grid-cell-label");
            div.appendChild(p);
        }

        return div;
    }

    // Is used to hide or show this grid
    setVisibility(state) {
        this.getMapContainer().style.display = state ? "grid" : "none";
    }

    // Completely clears the grid
    clear() {
        this.getMapContainer().innerHTML = "";
    }

    // Generates the grid by populating it with empty cells
    generate() {
        // Tell the CSS grid how many tiles we will have
        this.getMapContainer().setAttribute("style", "grid-template-columns: repeat(" + this.tilesX + ", 64px);")

        // Clear the cached cells
        this.cells = [];

        // Iterate through the rows and columns, create the cells, push them onto the cache, and append them on the DOM
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

    // Debug
    clearHighlight() {
        for (var y = 0; y < this.cells.length; y++) {
            for(var x = 0; x < this.cells[y].length; x++) {
                this.highlight(x, y, false);
            }
        }
    }

    // Debug
    highlight(x, y, state) {
        if (this.cells[y][x]) {
            this.cells[y][x].setAttribute("class", "map-grid-cell tileset " + (state ? "highlight" : ""));
        }
    }
}

// A layered grid contains n grid elements, where n is the amount of layers
class LayeredGrid {
    // Constructor
    constructor(tilesX, tilesY, layerCount) {
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        this.layerCount = layerCount;
        this.layers = [];
    }

    createLayerContainer(layer) {
        var div = document.createElement("div");
        div.setAttribute("class", "map-grid-container");
        div.setAttribute("id", "mapGridContainer_layer" + layer);

        document.getElementById("mapRoot").appendChild(div);
    }

    clearLayer(layer) {
        if (document.getElementById(this.getMapContainerName(layer))) {
            document.getElementById(this.getMapContainerName(layer)).remove();
        }
    }

    // Returns the DOM element name a layer div element should have (TODO: we might want to create them instead of hardcode)
    getMapContainerName(layer) {
        return "mapGridContainer_layer" + layer;
    }

    // Returns a DOM element for the specified layer
    getLayerContainer(layer) {
        return document.getElementById(this.getMapContainerName(layer));
    }

    // Returns x tile count
    getTilesX() {
        return this.tilesX;
    }

    // Returns y tile count
    getTilesY() {
        return this.tilesY;
    }

    // Sets a new size, clears all layers, and regenerates the grid
    setSize(newX, newY) {
        this.tilesX = newX;
        this.tilesY = newY;
        this.layers.forEach(function(layer) {
            layer.clear();
        });
        this.layers = [];
        this.generate();
    }

    // Generates the grid by initializing each layer and lets them generate
    generate() {
        for (var layer = 0; layer < this.layerCount; layer++) {
            this.clearLayer(layer);
            this.createLayerContainer(layer);
            let grid = new Grid(this.tilesX, this.tilesY, this.getMapContainerName(layer));
            grid.generate();
            grid.getMapContainer().style.zIndex = layer + 1;
            this.layers.push(grid);
        }
    }

    // Returns the grid for a specified layer
    getGrid(layer) {
        return this.layers[layer];
    }

    // Can toggle the visibility of certain layers
    setLayerVisibility(layer, visibile) {
        this.layers[layer].setVisibility(visibile);
    }
}
