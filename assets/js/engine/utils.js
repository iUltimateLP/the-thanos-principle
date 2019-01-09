/*
    File: utils.js
    Description: Utility functions for H A N D Y N E S S
*/

// Helper function to clamp a value to a minimum
function clampMin(val, min) {
    if (val < min) return min;
    else return val;
}

// Helper function to clamp a value to a range
function clamp(val, min, max) {
    if (val < min) return min;
    else if (val > max) return max;
    else return val;
}

// Converts a screen position to grid position
function screenPositionToGridPosition(x, y) {
    var gridPos = {};
    
    gridPos.x = Math.floor(x / 64);
    gridPos.y = Math.floor(y / 64);

    return gridPos;
}

// Gets a custom property off Tiled's map json format
function getLayerProperty(layer, propertyName) {
    var returnValue;

    if (layer.properties) {
        layer.properties.forEach(function(property) {
            if (property.name === propertyName) {
                returnValue = property.value;
            }
        });
    }

    return returnValue;
}
