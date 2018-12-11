/*
    File: debug.js
    Description: Contains functionality for the game's debug functions
*/

// Key handler for toggling debug menu
window.onkeyup = function(e) {
    // F9
    if (e.keyCode === 120) {
        var dbgMenu = document.getElementById("debug-menu");
        dbgMenu.style.display = dbgMenu.style.display === "block" ? "none" : "block"; 
    }
}

// Called by the debug menu check boxes
function onDebugShowLayer(layer, state) {
    level.setLayerVisibility(layer, state);
}
