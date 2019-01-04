/*
    File: debug.js
    Description: Contains functionality for the game's debug functions
*/

// Called by the debug menu check boxes
function onDebugShowLayer(layer, state) {
    level.setLayerVisibility(layer, state);
}
