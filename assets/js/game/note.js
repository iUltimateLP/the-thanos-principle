/*
    File: note.js
    Description: Piece of paper which contains a message when read
*/

// A simple note which has a text which it can display on interaction
class Note {
    // Constructor
    constructor(noteText, x, y) {
        // Cache the note text
        this.noteText = noteText;

        // Create the game object
        this.object = new GameObject({
            sprite: {
                spriteSheet: "assets/img/objects/note.png",
                tileCount: 1,
                tickRate: 0,
                tileWidth: 32,
                tileHeight: 32,
                renderWidth: 64,
                renderHeight: 64,
                renderPixelated: true
            },
            interactable: true,
            name: "note",
            renderLayer: 14, // 1 under the player
            animated: false,
            onInteract: this.onInteract.bind(this)
        }, x, y);
    }

    // Handle the interaction
    onInteract() {
        // Display the UI dialog box with the note text
        utils.displayDialogBox(this.noteText, 6000);

        // Play the note sound
        audioSystem.playSound(sounds.paper);

        // If a callback is set (optional), notify it
        if (this.onNoteRead) {
            this.onNoteRead();
        }
    }
}
