// Objects

r2d2 = {
    model : {
        default : {
            obj : "../../../assets/models/r2d2/r2d2.obj",
            mtl : "../../../assets/models/r2d2/r2d2.mtl"
        }
    },
    init : function(me) {
        console.log("Loaded the model!");
        //me.position = { x: 0, y: 0, z: 0 };
        scene.add(me);
        me.add(camera);
        r2d2.instance = me;
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
        console.log("Pick up!");
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
    }
};

floor = {
    model : {
        default : {
            obj : "../../../assets/models/floor/floor.obj",
            mtl : "../../../assets/models/floor/floor.mtl"
        }
    },
    init : function(me) {
        console.log("Loaded the floor");
        scene.add(me);
    }
};

input = {
    keys : {
        w : 87,
        a : 65,
        s : 83,
        d : 68,
        e : 69
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
            case input.keys.e:
            r2d2.activate();
            break;
        }

        if (event.which != 116) {
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
        }

        if (event.which != 116) {
            event.preventDefault();
        };
    }
}

stats = null;
scene = null;
renderer = null;
camera = null;
clock = null;
loader = null;

colorTransitionStepsPerSecond = 0.01
currentColorTarget = null;
currentColorTransitionStep = 1.0;

// Functions

function mainloop () {
    requestAnimationFrame(mainloop);
    var elapsedSeconds = clock.getDelta();
    update(elapsedSeconds);
    render();
}

function update (elapsedSeconds) {
    //camera.position.z += 0.1;
    //controls.update(elapsedSeconds);
    if ( currentColorTransitionStep < 1.0 ) {
        renderer.setClearColor(
            THREE.Color.interpolate(renderer.getClearColor(), currentColorTarget, currentColorTransitionStep)
        );
        currentColorTransitionStep += colorTransitionStepsPerSecond * elapsedSeconds;
    };
    r2d2.update(elapsedSeconds);
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

function startColorTransition (col) {
    currentColorTransitionStep = 0.0;
    currentColorTarget = col;
}

function init () {
    console.log( "-> init" );
    if(Detector.webgl){
        renderer = new THREE.WebGLRenderer({
            antialias : true,
            preserveDrawingBuffer : true,
            premultipliedAlpha : false,
            alpha : false
        });
        renderer.setClearColor( 0x000000 );

    }else{
        renderer = new THREE.CanvasRenderer();
    }
    // put a camera in the scene
    camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 2.5, -3.5);
    camera.rotateOnAxis(new THREE.Vector3(0,1,0), 3.14);

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

    // create a scene
    scene = new THREE.Scene();
    //create fog
    //scene.fog = new THREE.FogExp2( 0xC8C896, 0.0015 );
    //create a new clock
    clock = new THREE.Clock();

    //add first person controls
    //controls = new THREE.FirstPersonControls( camera );
    //controls.movementSpeed = 10;
    //controls.lookSpeed = 0.05;
    //controls.noFly = true;
    //controls.lookVertical = true;

    //THREEx.WindowResize.bind(renderer, camera);

    if(THREEx.FullScreen.available()) {
        THREEx.FullScreen.bindKey();
    }

    // create a point light
    var pointLight = new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 0;
    pointLight.position.y = 100;
    pointLight.position.z = 0;

    // add to the scene
    scene.add(pointLight);

    var ambientLight = new THREE.AmbientLight(0xFFFFFF);
    scene.add(ambientLight);

    loader = new THREE.OBJMTLLoader();
    loader.load(r2d2.model.default.obj, r2d2.model.default.mtl, r2d2.init);
    loader.load(floor.model.default.obj, floor.model.default.mtl, floor.init);

    var geometry = new THREE.CubeGeometry( 1, 1, 1 );

    var material = new THREE.MeshBasicMaterial({ color: 0x777777 });

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );


    // Capture input
    document.addEventListener( 'keypress', input.onKeyPress, false );
    document.addEventListener( 'keydown', input.onKeyDown, false );
    document.addEventListener( 'keyup', input.onKeyUp, false );

    //scene.add( mesh2 );

    //startColorTransition(new THREE.Color(0x8123a1));
    startColorTransition(new THREE.Color(0x764f33));

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