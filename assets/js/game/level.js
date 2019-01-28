/*
    File: level.js
    Description: This file acts like a "map script" or "level script". It handles loading of objects into the right places, sets them up for gameplay, ...
*/

/////////////////////////////////////////////////////////////////////
// Global item configuration
var items = {
    limestoneCube: {
        name: "limestone-cube",
        image: "assets/img/items/limestone-cube.png",
        friendlyName: "massive limestone cube"
    },
    hammer: {
        name: "hammer",
        image: "assets/img/items/hammer.png",
        friendlyName: "hammer"
    },
    rockCluster: {
        name: "rock-cluster",
        image: "assets/img/items/rock-cluster.png",
        friendlyName: "rocks"
    }
};

/////////////////////////////////////////////////////////////////////
// Stones

var stones = {};

function showStone(stone) {
    stones[stone].sprite.show();
    stones[stone].setOverlappable(true);

    stones[stone].sprite.getCanvas().classList.add("unlock-anim");
    setTimeout(function() {
        stones[stone].sprite.getCanvas().classList.remove("unlock-anim");
    }, 500);
}

// Unlocks a specific stone, type can be "space", "time", "mind", "soul", "reality", "power"
function unlockStone(stoneType) {
    document.getElementById("ui-" + stoneType + "-stone").classList.add("unlocked");
    stones[stoneType].pickedUp = true;

    musicManager.switchPhase(musicManager.getPhase() + 1);
}

/////////////////////////////////////////////////////////////////////
// Lever Puzzle

var levers = [];
var leverFailCount = 0;
var leverPuzzleFinished = false;

function checkLeverPuzzle() {
    if (levers[0].getState() && !levers[1].getState() && levers[2].getState() && !levers[3].getState() && !leverPuzzleFinished) {
        console.log("%cLever puzzle solved!", "color: green;");
        leverPuzzleFinished = true;
        levers.forEach(lever => lever.disable());
        document.getElementById("tooltip-e").style.display = "none";
        
        showStone("soul");
    } else if (!leverPuzzleFinished) {
        leverFailCount++;
    }

    if (leverFailCount == 10) {
        utils.displayDialogBox("Hmm, maybe I need to convert something...", 3000);
    } else if (leverFailCount == 15) {
        utils.displayDialogBox("Let's see. Bringing a number down four levers...", 3000);
    }
}

function onLeverStateChanged(index, newState) {
    checkLeverPuzzle();
}

/////////////////////////////////////////////////////////////////////
// Pressure Plates

var plates = [];
var platesPuzzleFinished = false;

function checkPlatePuzzle() {
    if (plates[0].getState() && plates[1].getState() && plates[2].getState() && !platesPuzzleFinished) {
        platesPuzzleFinished = true;
        console.log("%cPlates puzzle finished", "color: green;");
        plates.forEach(plate => plate.disable());
        document.getElementById("tooltip-e").style.display = "none";
        
        showStone("mind");
    }
}

/////////////////////////////////////////////////////////////////////
// Gauntlet

function onGauntletInteract() {
    var allStonesCollected = stones.space.pickedUp && stones.mind.pickedUp && stones.time.pickedUp && stones.reality.pickedUp && stones.power.pickedUp && stones.soul.pickedUp;
    
    if (allStonesCollected) {
        utils.fadeScreen(true);

        setTimeout(function() {
            window.location.href = "outro.html";
        }, 550);
    } else {
        utils.displayDialogBox("I can't activate this gauntlet before I collect all the stones.", 2000);
    }
}

/////////////////////////////////////////////////////////////////////
// Laser

var lasers = [];
var respawning = false;

function onLaserDeath() {
    if (!respawning) {
        respawning = true;
        utils.fadeScreen(true);
        audioSystem.playSound(sounds.laserDeath);

        setTimeout(function() {      
            var checkpointLayer = mapImporter.getObjectLayer("__CHECKPOINT").objects[0];
            player.setPosition(checkpointLayer.x*4-20, checkpointLayer.y*4);
            
            utils.fadeScreen(false);
            respawning = false;
        }, 2000);
    }
}

/////////////////////////////////////////////////////////////////////
// Lights

var lights = [];
var combinations = [
    [0, 1, 2],
    [2, 2, 1],
    [0, 2, 0],
    [0, 1, 0, 1],
    [0, 2, 1, 1, 1],
    [2, 1, 2, 1, 0],
    [0, 1, 2, 1, 0]
]
var currentStage = 0;
var currentLight = 0;
var combinationBuffer = [];
var isPlaying = false;
var lightsPuzzleFinished = false;

function playCombination() {
    lights[combinations[currentStage][currentLight]].setColor("blue");
    setTimeout(function() {
        lights[combinations[currentStage][currentLight]].setColor("white");
        currentLight++;
        if (currentLight >= combinations[currentStage].length) {
            currentLight = 0;
            combinationBuffer = [];

        } else {
            setTimeout(playCombination, 500); // Recursive
        }
    }, 200);
}

function checkSolution() {
    var success = true;
    for (var i = 0; i < combinationBuffer.length; i++) {

        if (combinationBuffer[i] != combinations[currentStage][i]) {
            success = false;
        }
    }
    return success;
}

function flash(color) {
    lights.forEach(function(light) {
        light.setColor(color);
    });

    setTimeout(function() {
        lights.forEach(function(light) {
            light.setColor("white");
        });
    }, 200);
}

function onLightActivated(index) {
    if (!lightsPuzzleFinished) {
        if (combinationBuffer.length == 0 && !isPlaying) {
            playCombination();
            isPlaying = true;
        } else if (combinationBuffer.length < combinations[currentStage].length && isPlaying) {
            combinationBuffer.push(index);

            lights[index].setColor("blue");
            setTimeout(function() {
                lights[index].setColor("white");
            }, 200);

            if (combinationBuffer.length == combinations[currentStage].length) {
                isPlaying = false;
                var success = checkSolution();
                combinationBuffer = [];

                if (success) {
                    currentStage++;
                    flash("green");
                    if (currentStage >= combinations.length) {
                        console.log("%cLights puzzle finished", "color: green;");
                        lightsPuzzleFinished = true;
                        lights[0].socket.setInteractable(false);
                        lights[1].socket.setInteractable(false),
                        lights[2].socket.setInteractable(false);
                        
                        showStone("space");
                    }
                } else {
                    flash("red");
                    currentStage = 0;
                }
                setTimeout(function() {
                    if (!lightsPuzzleFinished) {
                        playCombination();
                        isPlaying = true;
                    }
                }, 500);
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////

// Tiled handles all the tile layers, but we need to manually create objects for the layers and place them
// This would have been better if we could define it inside Tiled, but this does it's job
function populateLevelObjects() {
    console.log("%c[Level] Populating level objects", "font-weight: bold;");

    var objectLayers = mapImporter.getObjectLayers();

    objectLayers.forEach(function(currentObjectLayer) {
        switch(currentObjectLayer.name) {
            case "Note":
                // Since we only have one note in the level, we can hardcode the text. Not a great solution, but the time's running out 
                var note = new Note("number of pillars x number of crates / number of people who failed this riddle - the width of the ctrl room", currentObjectLayer.objects[0].x * 4, currentObjectLayer.objects[0].y * 4);
                note.onNoteRead = function() {
                    levers.forEach(function(lever) {
                        lever.object.setInteractable(true);
                    })
                }
                break;
            case "Levers":
                currentObjectLayer.objects.forEach(function(object, index) {
                    // To be fair, I don't know where the -50 is coming from. Seems like some trouble with images that aren't a power of two size. This is a workaround!
                    var lever = new Lever(index, false, object.x*4, object.y*4 - 50);
                    lever.onLeverStateChanged = checkLeverPuzzle;
                    lever.object.setInteractable(false);
                    levers.push(lever);
                });
                break;
            case "Podest":
                new GameObject({
                    sprite: {
                        spriteSheet: "assets/img/objects/podest.png",
                        tileCount: 1,
                        tickRate: 0,
                        tileWidth: 32,
                        tileHeight: 32,
                        renderWidth: 128,
                        renderHeight: 128,
                        renderPixelated: true
                    },
                    interactable: false,
                    name: "podest",
                    renderLayer: 13,
                    animated: false,
                    collidable: false,
                }, currentObjectLayer.objects[0].x*4, currentObjectLayer.objects[0].y*4-110);
                break;
            case "Gauntlet":
                new GameObject({
                    sprite: {
                        spriteSheet: "assets/img/objects/gauntlet.png",
                        tileCount: 1,
                        tickRate: 0,
                        tileWidth: 27,
                        tileHeight: 36,
                        renderWidth: 27*2,
                        renderHeight: 36*2,
                        renderPixelated: true
                    },
                    interactable: true,
                    name: "gauntlet",
                    renderLayer: 14,
                    animated: false,
                    onInteract: onGauntletInteract,
                    collidable: true
                }, currentObjectLayer.objects[0].x*4, currentObjectLayer.objects[0].y*4-48);            
                break;
            case "PressurePlates":
                currentObjectLayer.objects.forEach(function(obj, index) {
                    var plate = new PressurePlate(index, obj.x*4, obj.y*4);
                    plate.onPlateStateChanged = checkPlatePuzzle;
                    plates.push(plate);
                });
                break;
            case "Chest":
                currentObjectLayer.objects.forEach(function(obj) {
                    // TODO: make this better
                    var item;
                    switch(utils.getObjectProperty(obj, "item")) {
                        case "limestone-cube":
                            item = items.limestoneCube;
                            break;
                        case "hammer":
                            item = items.hammer;
                            break;
                    }

                    new Chest(item, obj.x*4, obj.y*4-115);
                });
                break;
            case "BreakableRock":
                currentObjectLayer.objects.forEach(function(obj) {
                    switch(obj.name) {
                        case "BigRock":
                            var bigRock = new Breakable(utils.getObjectProperty(obj, "health"), {
                                spriteSheet: "assets/img/objects/big-rock.png",
                                tileCount: 10,
                                tickRate: 0,
                                tileWidth: 32,
                                tileHeight: 64,
                                renderWidth: 64,
                                renderHeight: 128,
                                renderPixelated: true
                            }, obj.x*4+48, obj.y*4-100);
                            
                            var rockClusterDrop = new Pickup({
                                item: items.rockCluster
                            }, obj.x*4+48, obj.y*4-64);

                            rockClusterDrop.object.setInteractable(false);
                            rockClusterDrop.object.sprite.hide();

                            bigRock.onBroken = function() {
                                rockClusterDrop.object.setInteractable(true);
                                rockClusterDrop.object.sprite.show();
                            }
                            break;
                        case "SmallRock":
                            var smallRock = new Breakable(utils.getObjectProperty(obj, "health"), {
                                spriteSheet: "assets/img/objects/small-rock.png",
                                tileCount: 5,
                                tickRate: 0,
                                tileWidth: 32,
                                tileHeight: 32,
                                renderWidth: 64,
                                renderHeight: 64,
                                renderPixelated: true
                            }, obj.x*4, obj.y*4-64);

                            var timeStone = new GameObject({ 
                                sprite: {
                                    spriteSheet: "assets/img/stones/timestone.png",
                                    tileCount: 1,
                                    tickRate: 0,
                                    tileWidth: 32,
                                    tileHeight: 32,
                                    renderWidth: 64,
                                    renderHeight: 64,
                                    renderPixelated: true
                                },
                                interactable: false,
                                name: "timestone",
                                renderLayer: 13, // 1 above the player
                                animated: false,
                                collidable: false,
                                onStartOverlap: function() { 
                                    unlockStone("time"); 
                                    timeStone.remove(); 
                                    var stoneSounds = [sounds.stonePickup1, sounds.stonePickup2, sounds.stonePickup3, sounds.stonePickup4];
                                    var i = utils.clamp(Math.round(Math.random()*stoneSounds.length)-1, 0, stoneSounds.length);
                                    audioSystem.playSound(stoneSounds[i], false);
                                }
                            }, obj.x*4+28, obj.y*4-50);

                            timeStone.pickedUp = false;
                            stones.time = timeStone;

                            smallRock.onBroken = function() {
                                timeStone.setOverlappable(true);
                                utils.displayDialogBox("I'm sorry little one", 2000);
                                //player.getInventory().addItem(items.rockCluster);
                            }

                            break;
                    }
                });
                break;
            case "Stones":
                currentObjectLayer.objects.forEach(function(obj) {
                    if (obj.name != "Time") {
                        var newStone = new GameObject({ 
                            sprite: {
                                spriteSheet: "assets/img/stones/" + obj.name.toLowerCase() + "stone.png",
                                tileCount: 1,
                                tickRate: 0,
                                tileWidth: 32,
                                tileHeight: 32,
                                renderWidth: 64,
                                renderHeight: 64,
                                renderPixelated: true
                            },
                            interactable: false,
                            name: obj.name.toLowerCase(),
                            renderLayer: 13, // 1 above the player
                            animated: false,
                            collidable: false,
                            overlappable: !utils.getObjectProperty(obj, "conditional"),
                            onStartOverlap: function() { 
                                unlockStone(obj.name.toLowerCase()); 
                                newStone.remove();
                                var stoneSounds = [sounds.stonePickup1, sounds.stonePickup2, sounds.stonePickup3, sounds.stonePickup4];
                                var i = utils.clamp(Math.round(Math.random()*stoneSounds.length)-1, 0, stoneSounds.length);
                                audioSystem.playSound(stoneSounds[i], false);
                            }
                        }, obj.x*4, obj.y*4);

                        if (utils.getObjectProperty(obj, "conditional")) {
                            newStone.sprite.hide();
                        }

                        newStone.pickedUp = false;

                        stones[obj.name.toLowerCase()] = newStone;
                    }
                });
                break;
            case "Lasers_Bottom":
                currentObjectLayer.objects.forEach(function(obj) {
                    var laser = new Laser(obj.x*4, obj.y*4 - obj.height*4 + 20, obj.width*4, obj.height*4);
                    laser.onLaserDeath = onLaserDeath.bind(this);
                    lasers.push(laser);
                });
                break;
            case "Lasers_Top":
                currentObjectLayer.objects.forEach(function(obj) {
                    var laser = new Laser(obj.x*4, obj.y*4 - obj.height*4 + 20, obj.width*4, obj.height*4);
                    laser.onLaserDeath = onLaserDeath.bind(this);
                    lasers.push(laser);
                });
                break;
            case "Lights":
                currentObjectLayer.objects.forEach(function(obj, i) {
                    var light = new Light(i, obj.x*4, obj.y*4-64);
                    light.onLightActivated = onLightActivated.bind(this);
                    lights.push(light);
                });
                break;
        }
    });
}
