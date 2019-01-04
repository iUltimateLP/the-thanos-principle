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
const KEY_E = 69;

var keyStates = [];

function calculatePlayerMovementVector() {
    var vector = {x: 0, y: 0};

    if (keyStates[KEY_W]) {
        vector.y = vector.y - 1; // -y direction
    }

    if (keyStates[KEY_S]) {
        vector.y = vector.y + 1; // +y direction
    }

    if (keyStates[KEY_A]) {
        vector.x = vector.x - 1; // -x direction
    }

    if (keyStates[KEY_D]) {
        vector.x = vector.x + 1; // +z direction
    }

    return vector;
}

window.onkeydown = function(event) {
    keyStates[event.keyCode] = true;
}

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
