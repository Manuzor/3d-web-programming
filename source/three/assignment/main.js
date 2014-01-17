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
    }
};

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

    var geometry = new THREE.CubeGeometry( 1, 1, 1 );

    var material = new THREE.MeshBasicMaterial( { color: 0x777777 } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    startColorTransition(new THREE.Color(0x8123a1));

    geometry = new THREE.CubeGeometry( 1, 1, 1 );

    material = new THREE.MeshBasicMaterial( { color: 0x777777 } );

    mesh2 = new THREE.Mesh( geometry, material );
    mesh.add(mesh2);
    //scene.add( mesh2 );

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