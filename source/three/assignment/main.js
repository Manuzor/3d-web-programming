// Objects

r2d2 = {
    minTriggerActivationDistance : 2.8,
    model : {
        default : {
            obj : "../../../assets/models/r2d2/r2d2.obj",
            mtl : "../../../assets/models/r2d2/r2d2.mtl"
        }
    },
    init : function(me) {
        console.log("Loaded r2d2.");
        scene.add(me);
        me.add(camera);
        me.castShadow = true;
        me.receiveShadow = true;
        me.userData.color = new THREE.Color(0xffffff);
        startColorTransition(me.userData.color);
        setSpotlightTarget(me);
        me.add(spotLight);
        r2d2.instance = me;

        updateFramework.addListener(r2d2.update);
    },
    move : {
        forward : function () {
            console.log("Forward");
            r2d2.instance.position.z++;
        },
        backward : function () {
            console.log("Backwards");
            r2d2.instance.position.z--;
        },
        left : function () {
            console.log("Turn left");
        },
        right : function () {
            console.log("Turn right");
        },
    },
    moving : {
        forward : false,
        backward : false,
    },
    turning : {
        left : false,
        right : false,
    },
    activate : function () {
        function getClosestTrigger () {
            if (trigger.instances.length <= 0) {
                return null;
            };

            var reference = r2d2.instance.position.clone();
            reference.y = 2;
            var closest = trigger.instances[0];
            var closestDelta = new THREE.Vector3();
            var candidate = new THREE.Vector3();

            closestDelta.subVectors(closest.position, reference);
            for (var i = 1; i < trigger.instances.length; i++) {
                var trg = trigger.instances[i];
                candidate.subVectors(trg.position, reference);
                if (candidate.lengthSq() < closestDelta.lengthSq()) {
                    closest = trg;
                    closestDelta = candidate.clone();
                };
            };

            return {trigger: closest, delta: closestDelta};
        }
        function unsetActiveTrigger () {
            if (trigger.active == null) {
                return;
            };
            trigger.active.scale.set(trigger.targetScale, trigger.targetScale, trigger.targetScale);
            trigger.active = null;
        }

        var closest = getClosestTrigger();
        if (closest.trigger != null && trigger.active !== closest.trigger && closest.delta.length() < r2d2.minTriggerActivationDistance) {
            unsetActiveTrigger();
            trigger.active = closest.trigger;
            trigger.active.scale.set(trigger.activeScale, trigger.activeScale, trigger.activeScale);
            startColorTransition(closest.trigger.userData.color);
            setSpotlightTarget(closest.trigger);

        } else {
            unsetActiveTrigger();
            setSpotlightTarget(r2d2.instance);
            startColorTransition(r2d2.instance.userData.color);
        };
    },
    instance : null,
    speed : { // always: units per second
        turn : Math.PI / 2,
        movement : 5,
    },
    update : function(elapsedSeconds)
    {
        if (r2d2.turning.left) {
            r2d2.instance.rotateY(r2d2.speed.turn * elapsedSeconds);
        };
        if (r2d2.turning.right) {
            r2d2.instance.rotateY(-r2d2.speed.turn * elapsedSeconds);
        };
        if (r2d2.moving.forward) {
            r2d2.instance.position = r2d2.instance.localToWorld(new THREE.Vector3(0, 0, 1).multiplyScalar(r2d2.speed.movement * elapsedSeconds));
        };
        if (r2d2.moving.backward) {
            r2d2.instance.position = r2d2.instance.localToWorld(new THREE.Vector3(0, 0, -1).multiplyScalar(r2d2.speed.movement * elapsedSeconds));
        };

        if (r2d2.instance != null) {
            var bounds = floor.getBounds();
            r2d2.instance.position.clamp(bounds.min, bounds.max);
        };
    }
};

trigger = {
    instances : new Array(10), // The initial length tells how many are going to be generated initially.
    growthRate : 0.5, // per second
    initialScale : 0.1,
    targetScale : 1.0,

    active : null,
    activeScale : 1.5,

    // methods
    create : function(grow){
        grow = grow || true;

        var colValue = Math.random() * 0xffffff;
        var trg = new THREE.Mesh(
                new THREE.CubeGeometry(2, 2, 2),
                new THREE.MeshLambertMaterial({ color: colValue, transparent : true, opacity : 0.75 })
            );
        trg.castShadow = true;
        trg.receiveShadow = true;
        trg.userData.color = new THREE.Color(colValue);
        trg.scale.set(trigger.initialScale, trigger.initialScale, trigger.initialScale);
        trg.position.set(
            Math.random() * 50 - 25,
            Math.random() * 2 + 1,
            Math.random() * 50 - 25
            );
        if (grow) {
            updateFramework.addListener(function (elapsedSeconds) {
                if (trg.scale.x >= trigger.targetScale) {
                    return "remove";
                };
                trg.scale.addScalar(trigger.growthRate * elapsedSeconds);
            });
        };
        return trg;
    }
}

floor = {
    instance : null,
    scale : new THREE.Vector3(25, 1, 25),
    model : {
        default : {
            obj : "../../../assets/models/floor/floor.obj",
            mtl : "../../../assets/models/floor/floor.mtl"
        }
    },
    init : function(me) {
        console.log("Loaded the floor.");
        me.receiveShadow = true;
        me.scale = floor.scale;
        scene.add(me);
        floor.instance = me;
    },
    getBounds : function () {
        var max = floor.scale.clone();
        var min = max.clone();
        min.multiplyScalar(-1);
        max.y = min.y = 0.0;

        return new THREE.Box3(min, max);
    },
    getBoundsPairs : function () {
        var bounds = floor.getBounds();
        return [
            [bounds.min.x, bounds.max.x],
            [bounds.min.y, bounds.max.y],
            [bounds.min.z, bounds.max.z]
        ];
    }
};

input = {
    keys : {
        w : 87,
        a : 65,
        s : 83,
        d : 68,
        e : 69,
        f : 70,
        f1 : 112,
        f2 : 113,
        f3 : 114,
        f4 : 115,
        f5 : 116,
        f6 : 117,
        f7 : 118,
        f8 : 119,
        f9 : 120,
        f10 : 121,
        f11 : 122,
        f12 : 123,
        space : 32,
    },
    onKeyPress : function (event) {
        event.preventDefault();
        console.log("Key press");
    },
    onKeyDown : function(event){
        keyDown = event;

        switch(event.which)
        {
            case input.keys.w:
            r2d2.moving.forward = true;
            break;
            case input.keys.s:
            r2d2.moving.backward = true;
            break;
            case input.keys.a:
            r2d2.turning.left = true;
            break;
            case input.keys.d:
            r2d2.turning.right = true;
            break;
            case input.keys.space:
            var trg = trigger.create();
            trigger.instances.push(trg);
            scene.add(trg);
            break;
            //Keys that are ignored on purpose:
            case input.keys.e: break;
            default:
            console.log("Unhandled key down: " + event.which);
            break;
        }

        if (event.which < input.keys.f1 || event.which > input.keys.f12) {
            event.preventDefault();
        };
    },
    onKeyUp : function(event){
        keyDown = event;

        switch(event.which)
        {
            case input.keys.w:
            r2d2.moving.forward = false;
            break;
            case input.keys.s:
            r2d2.moving.backward = false;
            break;
            case input.keys.a:
            r2d2.turning.left = false;
            break;
            case input.keys.d:
            r2d2.turning.right = false;
            break;
            case input.keys.e:
            r2d2.activate();
            break;
            case input.keys.f:
            if (THREEx.FullScreen.activated()) {
                THREEx.FullScreen.cancel();
            } else {
                THREEx.FullScreen.request();
            };
            break;
            //Keys that are ignored on purpose:
            case input.keys.space: break;
            default:
            console.log("Unhandled key up: " + event.which);
            break;
        }

        if (event.which != 116) {
            event.preventDefault();
        };
    }
}

stats = null;

sun = null;
spotLight = null;
scene = null;
renderer = null;
camera = null;
camControls = null;

clock = null;
loader = null;

colorTransitionStepsPerSecond = 0.01;
currentColorTarget = null;
currentColorTransitionStep = 1.0;

// Functions

function mainloop () {
    requestAnimationFrame(mainloop);
    var elapsedSeconds = clock.getDelta();
    update(elapsedSeconds);
    render();
}

updateFramework = {
    _inputBuffer : new Array(),
    _callbacks : new Array(),
    _indicesToRemove : new Array(),
    addListener : function (callback) {
        updateFramework._inputBuffer.push(callback);
    },
    update : function (elapsedSeconds) {
        // Call all callbacks.
        for (var i = 0; i < updateFramework._callbacks.length; i++) {
            var result = updateFramework._callbacks[i](elapsedSeconds);
            if (result == "remove") {
                //TODO: implement me!
                //updateFramework._indicesToRemove.push(i);
            };
        };
        // Remove all callbacks that requested so.
        for (var i = 0; i < updateFramework._indicesToRemove.length; i++) {
            updateFramework._callbacks.splice(trigger._indicesToRemove[i], 1);
        };
        // Clear the list of removable indices.
        if (updateFramework._indicesToRemove.length > 0) {
            updateFramework._indicesToRemove = new Array();
        };
        // Put all callbacks of the input buffer in the list of callbacks...
        for (var i = 0; i < updateFramework._inputBuffer.length; i++) {
            updateFramework._callbacks.push(updateFramework._inputBuffer[i]);
        };
        // ... and clear the input buffer.
        if (updateFramework._inputBuffer.length > 0) {
            updateFramework._inputBuffer = new Array();
        };
    }
}

function update (elapsedSeconds) {
    updateFramework.update(elapsedSeconds);
}

function render () {
    renderer.render(scene, camera);
    stats.update();
}

THREE.Color.interpolate = function (startCol, endCol, step) {
    var result = new THREE.Color(0);
    startCol = startCol.getHSL();
    endCol = endCol.getHSL();
    result.setHSL(
        (startCol.h - (startCol.h - endCol.h) * step),
        (startCol.s - (startCol.s - endCol.s) * step),
        (startCol.l - (startCol.l - endCol.l) * step));
    return result;
}

// @param col a THREE.Color instance.
function startColorTransition (col) {
    currentColorTransitionStep = 0.0;
    currentColorTarget = col;
}

function updateColors (elapsedSeconds) {
    if ( currentColorTransitionStep < 1.0 ) {
        var newColor = THREE.Color.interpolate(renderer.getClearColor(), currentColorTarget, currentColorTransitionStep);
        renderer.setClearColor(newColor);
        //spotLight.color = newColor;
        currentColorTransitionStep += colorTransitionStepsPerSecond * elapsedSeconds;
    };
}

function setSpotlightTarget (target) {
    target.add(spotLight);
    spotLight.target = target;
    spotLight.angle = 0.3;
    if (target.userData.color) {
        spotLight.color = target.userData.color;
    };
}

function init () {
    initUtils = function () {
        Math.clamp = function(value, min, max)
        {
            if (value < min) {
                return min;
            };
            if (value > max) {
                return max;
            };
            return value;
        }
    };
    console.log( "-> init" );
    initUtils();
    if(Detector.webgl){
        renderer = new THREE.WebGLRenderer({
            antialias : true,
            preserveDrawingBuffer : true,
            premultipliedAlpha : false,
            alpha : false
        });
        renderer.shadowMapEnabled = true;
        renderer.setClearColor( 0x000000 );

    }else{
        renderer = new THREE.CanvasRenderer();
    }

    // set up camera and camera controls
    camera = new THREE.PerspectiveCamera();

    camControls = new THREE.OrbitControls(camera);
    camControls.noKeys = true;
    camControls.noPan = true;
    camControls.center.set(0, 3, 0);
    camControls.rotateUp(Math.PI / 2 + Math.PI / 16);
    camControls.rotateLeft(Math.PI);
    updateFramework.addListener(function (elapsedSeconds) {
        camControls.update();
    });

    //camera.position.set(0, 2.5, -3.5);
    //camera.rotateOnAxis(new THREE.Vector3(0,1,0), 3.14);

    // Set a callback for when the window resizes.
    var windowResizedCallback = function () {
        renderer.setSize( window.innerWidth, window.innerHeight );
        var context = renderer.getContext();
        camera.aspect = context.drawingBufferWidth / context.drawingBufferHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', windowResizedCallback, false);

    windowResizedCallback();

    // Put the render canvas in the document
    document.getElementById('main').appendChild(renderer.domElement);
    var textHeader = document.getElementById('textHeader');
    //renderer.domElement.appendChild(document.getElementById('textHeader'));

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.right = '0px';
    document.body.appendChild( stats.domElement );

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    sun = new THREE.DirectionalLight(0xffffff);
    sun.position.set(100, 100, 100);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0x000000, 0xaaaaaa));

    loader = new THREE.OBJMTLLoader();
    loader.load(r2d2.model.default.obj, r2d2.model.default.mtl, r2d2.init);
    loader.load(floor.model.default.obj, floor.model.default.mtl, floor.init);

    // Capture input
    document.addEventListener('keypress', input.onKeyPress, false);
    document.addEventListener('keydown', input.onKeyDown, false);
    document.addEventListener('keyup', input.onKeyUp, false);

    // Initial color transition: black -> white
    //startColorTransition(new THREE.Color(0xffffff)); // this is done by r2d2 already
    // register the color updater.
    updateFramework.addListener(updateColors);

    // Set up shadows
    renderer.shadowMapSoft = true;

    renderer.shadowCameraNear = 3;
    renderer.shadowCameraFar = camera.far;
    renderer.shadowCameraFov = 50;

    renderer.shadowMapBias = 0.0039;
    renderer.shadowMapDarkness = 0.5;
    renderer.shadowMapWidth = 1024;
    renderer.shadowMapHeight = 1024;

    spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 0, 5, 0 );
    spotLight.castShadow = true;
    spotLight.shadowMapWidth = 1024;
    spotLight.shadowMapHeight = 1024;
    spotLight.shadowCameraNear = 500;
    spotLight.shadowCameraFar = 4000;
    spotLight.shadowCameraFov = 30;
    spotLight.exponent = 0;
    spotLight.angle = 0.1;
    scene.add( spotLight );
    //updateFramework.addListener(trigger.grow);

    // Add initial triggers.
    for (var i = 0; i < trigger.instances.length; i++) {
        trigger.instances[i] = trigger.create();
        scene.add(trigger.instances[i]);
    };

    console.log("<- init");
}

function main () {
    init();
    mainloop();
}

// Misc helper
function toggle_info_section(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'none') {
        e.style.display = 'block';
    } else {
        e.style.display = 'none';
    }
}