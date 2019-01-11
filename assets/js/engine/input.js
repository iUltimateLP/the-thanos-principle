/*
    File: input.js
    Description: Global game input handler
*/

// Keys used by the game
const KEY_F9 = 120;
const KEY_W = 87;
const KEY_A = 65;
const KEY_D = 68;
const KEY_S = 83;
const KEY_ARROWUP = 38;
const KEY_ARROWDOWN = 40;
const KEY_ARROWLEFT = 37;
const KEY_ARROWRIGHT = 39;
const KEY_E = 69;

// Keeping track of the pressed keys
var keyStates = [];

// This calculates a two-dimensional movement vector based on the pressed movement keys
function calculatePlayerMovementVector() {
    var vector = {x: 0, y: 0};

    if (keyStates[KEY_W] || keyStates[KEY_ARROWUP]) {
        vector.y = vector.y - 1; // -y direction
    }

    if (keyStates[KEY_S] || keyStates[KEY_ARROWDOWN]) {
        vector.y = vector.y + 1; // +y direction
    }

    if (keyStates[KEY_A] || keyStates[KEY_ARROWLEFT]) {
        vector.x = vector.x - 1; // -x direction
    }

    if (keyStates[KEY_D] || keyStates[KEY_ARROWRIGHT]) {
        vector.x = vector.x + 1; // +z direction
    }

    return vector;
}

// Handle on key down event
window.onkeydown = function(event) {
    keyStates[event.keyCode] = true;
}

// Handle on key up event
window.onkeyup = function(event) {
    var key = event.keyCode;

    console.log("%c[Input] Received input with key code " + key + " (" + event.key + ")", "font-weight: bold;");

    // F9 - Debug Menu
    if (key === KEY_F9) {
        var dbgMenu = document.getElementById("debug-menu");
        dbgMenu.style.display = dbgMenu.style.display === "block" ? "none" : "block";
    }

    keyStates[key] = false;
}

// Handle the wheel event to prevent scrolling (we have a fixed camera)
window.onwheel = function(event) {
    event.preventDefault();
}
