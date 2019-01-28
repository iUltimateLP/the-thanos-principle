/*
    File: sounds.js
    Description: Handles a few sound/audio related things such as initializing the audio system and managing the music
*/

// Maps all game sound sources to their files on disk
var sounds = {
    chest: "assets/sound/Chest.wav",
    crateClose: "assets/sound/CrateClose.wav",
    crateOpen: "assets/sound/CrateOpen.wav",
    damage: "assets/sound/Damage.wav",
    footsteps: "assets/sound/Footsteps.wav",
    laser: "assets/sound/Laser.wav",
    laserDeath: "assets/sound/LaserDeath.wav",
    leverOff: "assets/sound/LeverOff.wav",
    leverOn: "assets/sound/LeverOn.wav",
    paper: "assets/sound/Paper.wav",
    plate: "assets/sound/Plate.wav",
    light: "assets/sound/Scheinwerfer.wav",
    stonePickup1: "assets/sound/Stones1.wav",
    stonePickup2: "assets/sound/Stones2.wav",
    stonePickup3: "assets/sound/Stones3.wav",
    stonePickup4: "assets/sound/Stones4.wav",
    torch: "assets/sound/Torch.wav",
    rock1: "assets/sound/Rock1.wav",
    rock2: "assets/sound/Rock2.wav",
    rock3: "assets/sound/Rock3.wav",
    musicPhase0: "assets/sound/music/0-stones.wav",
    musicPhase1: "assets/sound/music/1-stones.wav",
    musicPhase2: "assets/sound/music/2-stones.wav",
    musicPhase3: "assets/sound/music/3-stones.wav",
    musicPhase4: "assets/sound/music/4-stones.wav",
    musicPhase5: "assets/sound/music/5-stones.wav",
    musicPhase6: "assets/sound/music/6-stones.wav"
}

const CROSSFADE_LENGTH = 1000; // Crossfade should take up a second
const CROSSFADE_UPDATE = 50; // Update the crossfade every 50ms

// Class for handling the game music and fading between different phases
class MusicManager {
    // Constructor
    constructor() {
        // Initialize some variables
        this.currentPhase = 0;
        this.currentCrossfade = 0;

        // We use this to store the current and next sound object for fading
        this.current = {};
        this.next = {};
    }

    // Returns the sound object for the current phase
    getPhaseSound(phase) {
        return sounds[Object.keys(sounds).filter(key => key.startsWith("music") && key.endsWith(phase))[0]];
    }

    // Returns the current phase
    getPhase() {
        return this.currentPhase;
    }

    // Creates the audio node setup for a specific phase, the structure of this sound object is
    /*
        {
            bufferSource: JS audio buffer source
            gainNode: gain Node
        }
    */
    createNodes(phase) {
        var nodes = {}

        // Create the buffer source for the phase sound file
        nodes.bufferSource = audioSystem.createBufferSource(this.getPhaseSound(phase));
        nodes.bufferSource.loop = true;

        // Create the gain node for fading 
        nodes.gainNode = audioSystem.getAudioContext().createGain();

        // Connect the nodes
        nodes.bufferSource.connect(nodes.gainNode);
        nodes.gainNode.connect(audioSystem.getAudioContext().destination);
        
        return nodes;
    }

    // Starts the music by playing the first phase
    start() {
        this.current = this.playPhase(0);
    }

    // Creates the node setup and immediately starts the new phase
    playPhase(phase) {
        var newPhase = this.createNodes(phase);
        newPhase.bufferSource.start(0);

        return newPhase;
    }

    // Called on a periodic interval to update the crossfade
    tickCrossfade() {
        // Increment the current crossfade
        this.currentCrossfade += (1.0 / (CROSSFADE_LENGTH / CROSSFADE_UPDATE));

        // Apply the gain (linear)
        this.current.gainNode.gain.value = 1.0 - this.currentCrossfade;
        this.next.gainNode.gain.value = this.currentCrossfade;

        // If we didn't reach the end yet, set up the next tick
        if (this.currentCrossfade < 1.0) {
            setTimeout(this.tickCrossfade.bind(this), CROSSFADE_UPDATE);
        } 
        // Otherwise stop the old phase, and set the new one as the new current one, making space for the next crossfade
        else {
            this.current.bufferSource.stop();
            this.current = this.next;
            this.next = {};
        }
    }

    // Crossfades between the current and next phase
    switchPhase(newPhase) {
        // Set the new phase as the next one
        this.next = this.playPhase(newPhase);

        // Reset the crossfade
        this.currentCrossfade = 0;
        this.currentPhase = newPhase;

        // Start ticking the crossface
        this.tickCrossfade();
    }
}

// Create a new audio system instance, and start loading all sound source files
var audioSystem = new AudioSystem();
audioSystem.loadSounds(sounds);

// Create a new music manager instance
var musicManager = new MusicManager();

// Once the sound files are finished, initialize all positional audio sound sources
audioSystem.onFinishedSoundLoading = function() {
    // Iterate through all objects in the Sounds layer
    mapImporter.getObjectLayer("Sounds").objects.forEach(function(obj) {
        // Initialize the positional sound and start it
        var snd = new PositionalSound(sounds[utils.getObjectProperty(obj, "sound")], obj.x*4, obj.y*4, obj.width*4);
        snd.start(true);
    });

    // Start the music
    musicManager.start();    
};
