/*
    File: audio.js
    Description: Class for handling all the audio interactions between the game and engine
*/

// This class loads a list of sound source files into a buffer list
class BufferLoader {
    // Constructor taking the audio context, list of URLs to the sounds, and a callback to fire once the loading has completed
    constructor(ctx, urlList, callback) {
        this.context = ctx;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = [];
        this.loadCount = 0;
    }

    // Loads one file
    loadBuffer(url, index) {
        // Load buffer asynchronously using XML Header Requests
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer"; // JS actually supports this

        // Reference to ourself
        var loader = this;

        // Set up the onload handler
        request.onload = function() {
            // Asynchronously decode the audio file data in request.response
            loader.context.decodeAudioData(request.response, function(buffer) {
                    if (!buffer) {
                        console.error("[Audio] Error decoding file: " + url);
                        return;
                    }

                    loader.bufferList[index] = buffer;

                    if (++loader.loadCount == loader.urlList.length) {
                        loader.onload(loader.bufferList);
                    }
                },
                function(error) {
                    console.error("[Audio] decodeAudioData error: " + error);
                }
            );        
        }

        // Setup the onerror handler
        request.onerror = function() {
            console.error("[Audio] XHR Error");
        }

        // Finally send off the request
        request.send();
    }

    // Just iterates through the list and loads the sources
    load() {
        for (var i = 0; i < this.urlList.length; ++i) {
            this.loadBuffer(this.urlList[i], i);
        }
    }
}

// Class for managing all the audio from the game
class AudioSystem {
    // Constructor
    constructor() {
        // Get rid of webkit
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        // Create a new audio context for us to use
        this.audioCtx = new AudioContext();
    }

    // Loads all sounds into buffers for fast playback later on
    loadSounds(soundObject) {
        // The buffer loader wants an array of the raw URLs, but we have a handy mapping, so iterate through the keys of the sound property,
        // and add their values to the source file array
        var soundSourceFiles = [];

        Object.keys(soundObject).forEach(function(key) {
            soundSourceFiles.push(soundObject[key]);
        });

        // Create a new buffer loader and load the sound files
        var bufferLoader = new BufferLoader(this.audioCtx, soundSourceFiles, this.onFinishedLoading.bind(this));

        this.soundObject = soundObject;

        bufferLoader.load();
    }

    // Callback for finished loading
    onFinishedLoading(bufferList) {
        console.log("%c[Audio] Loaded " + bufferList.length + " audio files", "font-weight: bold;");
        this.bufferList = bufferList;

        if (this.onFinishedSoundLoading) {
            this.onFinishedSoundLoading();
        }
    }

    // Getter for the audio context
    getAudioContext() {
        return this.audioCtx;
    }

    // Plays a specified sound with optional looping
    playSound(sound, looping) {
        // Create the buffer source for the audio context
        var source = this.createBufferSource(sound);

        // Connect the buffer source to the audio context's destination (the speakers)
        source.connect(this.audioCtx.destination);

        // Set the loop flag
        source.loop = looping;

        // Start at the beginning
        source.start(0);

        // Return the source in case the user wants to stop the music again
        return source;
    }

    // Just creates the buffer source, does not connect to the context => good for custom play behaviour
    createBufferSource(sound) {
        // Create the buffer source for the audio context
        var source = this.audioCtx.createBufferSource();

        // Some predicate search trickery: search the index of the wanted sound in the buffer list
        var bufferIndex = Object.keys(this.soundObject).findIndex(key => sound == this.soundObject[key]);

        source.buffer = this.bufferList[bufferIndex];

        // Return the source
        return source;
    }
}

// Audio component which has a position and which changes the volume based on the position
class PositionalSound {
    // Constructor taking a sound, coordinates and radius
    constructor(sound, x, y, radius) {
        this.sound = sound;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.currentVolume = 0;
    }

    // Start the sound
    start(looping) {
        // Create the new buffer source and set it to looping
        this.bufferSource = audioSystem.createBufferSource(this.sound);
        this.bufferSource.loop = looping;

        // Hook up a gain node for fading the volume
        this.gainNode = audioSystem.getAudioContext().createGain();
        this.bufferSource.connect(this.gainNode);
        this.gainNode.connect(audioSystem.getAudioContext().destination);

        // Start the buffer source
        this.bufferSource.start(0);

        // Tick the volume update
        this.updateVolume();
    }

    // Stop the sound
    stop() {
        this.bufferSource.stop();
    }

    // Update the volume based on the distance between the sound and the player
    updateVolume() {
        // Get the distance between the player and this sound source
        var dstX = Math.abs(player.position.x - this.x);
        var dstY = Math.abs(player.position.y - this.y);
        var distance = Math.sqrt(Math.pow(dstX, 2) + Math.pow(dstY, 2));
        
        // If the distance is bigger than the radius, mute the audio
        if (distance > this.radius) {
            this.currentVolume = 0;
        } else {
            // Use a cosinus function to make the transitions more smooth
            this.currentVolume = Math.cos((distance / this.radius) * 0.5 * Math.PI);
        }

        // Apply the volume to the gain node
        this.gainNode.gain.value = this.currentVolume;

        // This is ticking, so update it next tick
        window.requestAnimationFrame(this.updateVolume.bind(this));
    }
}
