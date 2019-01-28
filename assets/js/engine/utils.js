/*
    File: utils.js
    Description: Utility functions for H A N D Y N E S S
*/

var utils = {
    // Helper function to clamp a value to a minimum
    clampMin: function(val, min) {
        if (val < min) return min;
        else return val;
    },

    // Helper function to clamp a value to a range
    clamp: function(val, min, max) {
        if (val < min) return min;
        else if (val > max) return max;
        else return val;
    },

    // Converts a screen position to grid position
    screenPositionToGridPosition: function(x, y) {
        var gridPos = {};
        
        gridPos.x = Math.floor(x / 64);
        gridPos.y = Math.floor(y / 64);

        return gridPos;
    },

    // Gets a custom property off Tiled's map json format
    getLayerProperty: function(layer, propertyName) {
        var returnValue;

        if (layer.properties) {
            layer.properties.forEach(function(property) {
                if (property.name === propertyName) {
                    returnValue = property.value;
                }
            });
        }

        return returnValue;
    },

    // Gets a custom property off Tiled's map json format (objects)
    getObjectProperty: function(object, propertyName) {
        var returnValue;

        if (object.properties) {
            object.properties.forEach(function(property) {
                if (property.name === propertyName) {
                    returnValue = property.value;
                }
            });
        }

        return returnValue;    
    },

    // Displays a dialog box for n seconds
    displayDialogBox: function(text, timeout) {
        var noteDialog = document.getElementById("note-dialog");
        var textElement = document.getElementById("note-text");

        textElement.innerText = text.toUpperCase();
        noteDialog.style.animationDirection = "normal";
        noteDialog.classList.remove("fade-out");
        noteDialog.classList.add("fade-in");
        noteDialog.style.display = "block";

        setTimeout(function() {
            noteDialog.classList.remove("fade-in");
            noteDialog.classList.add("fade-out");
            noteDialog.style.animation = 'none';
            noteDialog.offsetHeight;
            noteDialog.style.animation = null;
            noteDialog.style.animationDirection = "reverse";

            setTimeout(function() {
                noteDialog.style.display = "none";
            }, 500)
        }, timeout);
    },

    // Checks if a point is in a rectangle
    isPointInRectangle: function(rx, ry, rw, rh, x, y) {
        return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    },

    // Checks if two rectangles overlap
    isRectangleOverlapping: function(x1, y1, w1, h1, x2, y2, w2, h2) {
        // Create bounding rect coordinates for easier calculation
        rect1 = {
            left: x1,
            right: x1+w1,
            top: y1,
            bottom: y1+h1
        };

        rect2 = {
            left: x2,
            right: x2+w2,
            top: y2,
            bottom: y2+h2
        };

        // Calculate the x and y overlap area
        var xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
        var yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));

        // If the overall overlap area (px²) is > 0, we overlap
        return (xOverlap * yOverlap) > 0;
    },

    // Toggles the interaction tooltip (small E)
    setInteractionTooltipState: function(state, x, y) {
        document.getElementById("tooltip-e").style.display = state ? "block" : "none";
                        
        // Use +16,-32 as an offset to center the tooltip
        document.getElementById("tooltip-e").style.left = x + "px";
        document.getElementById("tooltip-e").style.top = y + "px";
    },

    // Fades the screen in or out
    fadeScreen: function(toBlack) {
        document.getElementById("fade-overlay").classList.remove("fade");
        document.getElementById("fade-overlay").classList.add("fade");
        document.getElementById("fade-overlay").style.animation = 'none';

        // This is a JS workaroud to cause reflow => redisplays animation
        document.getElementById("fade-overlay").offsetHeight;
        document.getElementById("fade-overlay").style.animation = null;

        // Decide which direction the fade animation should have
        document.getElementById("fade-overlay").style.animationDirection = toBlack ? "normal" : "reverse";
    }
};
