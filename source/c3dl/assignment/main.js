duck = {
    paths : {
        model : "../../../assets/models/duck/duck.dae",
        texture : "../../../assets/models/duck/duck.png"
    },
    instances : new Array(10),
    angularVelOnClick : [ 0, 0.001, 0 ],
    activelyRotating : null,
    width : 75,
    height : 100,

    // methods
    setPicked : function(d){
        if ( d == null ) {
            return;
        };
        if ( duck.activelyRotating == null ) {
            duck.activelyRotating = d;
            duck.activelyRotating.setAngularVel(duck.angularVelOnClick);
            return;
        };

        duck.activelyRotating.setAngularVel([0, 0, 0]);

        if (d != duck.activelyRotating) {
            duck.activelyRotating = d;
            duck.activelyRotating.setAngularVel(duck.angularVelOnClick);
        } else {
            duck.activelyRotating = null;
        };
    }
};

var formations = {
    line_right : function(){
        for (var i = 0; i < duck.instances.length; i++) {
            var instance = duck.instances[i];
            instance.setPosition([ -duck.width * i * 2, 0, 0 ]);
        };
    },
    line_left : function(){
        for (var i = 0; i < duck.instances.length; i++) {
            var instance = duck.instances[i];
            instance.setPosition([ duck.width * i * 2, 0, 0 ]);
        };
    },
    line_centered : function(){
        var x = -1;
        for (var i = 0; i < duck.instances.length; i++, x = -x) {
            var instance = duck.instances[i];
            instance.setPosition([ -duck.width * i * x, 0, 0 ]);
        };
    },
    square : function(){
        
    },
    wedge : function(){
        for (var i = 0; i < duck.instances.length; i++) {
        };
    }
}

c3dl.addModel(duck.paths.model);

function go (theName) {
    canvasMain(theName);
}

var isDragging = false; //tracks or not the user is currently dragging the mouse
var isZooming = false;
var rotationStartCoords = [0,0]; //The mouse coordinates at the beginning of a rotation
var SENSITIVITY = 0.7;
var zoomingSensitivityFactor = 0.5;

var mouse = {
    down : {
        startCoords : { x : 0, y : 0 },
        prevCoords : { x : 0, y: 0 },
        currCoords : { x : 0, y: 0 },
        delta : { x : 0, y : 0 },
        deltaStart : { x : 0, y : 0 }
    }
}

//Called when the user releases the left mouse button.
//Records that the user is no longer dragging the mouse
function mouseUp(evt)
{
    if(evt.which == 1) {
        isDragging = false;
    } else if (evt.which == 2) {
        isZooming = false;
    };
}

//Called when the user presses the left mouse button.
//Records that the user may start to drag the mouse, along with the current X & Y
// coordinates of the mouse.
function mouseDown(evt)
{
    mouse.down.startCoords = mouse.down.prevCoords = mouse.down.currCoords = { x : evt.clientX, y : evt.clientY };

    if(evt.which == 1) {
        isDragging = true;
        rotationStartCoords[0] = calcRelativeMouseX(evt);
        rotationStartCoords[1] = calcRelativeMouseY(evt);
    } else if(evt.which == 2) {
        isZooming = true;
    }
}

//Called when the mouse moves
//This function will only do anything when the user is currently holding
// the left mouse button.  It will determine how far the cursor has moved
// since the last update and will pitch and yaw the camera based on that
// amount and the sensitivity variable.
function mouseMove(evt)
{
    mouse.down.prevCoords = mouse.down.currCoords;
    mouse.down.currCoords = { x : 0, y : 0 };
    //mouse.down.delta = {
    //    x : mouse.down.currCoords.x - mouse.down.prevCoords.x,
    //    y : mouse.down.currCoords.y - mouse.down.prevCoords.y
    //}
    //mouse.down.deltaStart = {
    //    x : mouse.down.startCoords.x - mouse.down.prevCoords.x,
    //    y : mouse.down.startCoords.y - mouse.down.prevCoords.y
    //}
    if(isDragging)
    {
        var cam = scene.getCamera();
        var x = calcRelativeMouseX(evt);
        var y = calcRelativeMouseY(evt);

        // how much was the cursor moved compared to last time
        // this function was called?
        var deltaX = x - rotationStartCoords[0];
        var deltaY = y - rotationStartCoords[1];

        cam.yaw(-deltaX * SENSITIVITY);
        cam.pitch(deltaY * SENSITIVITY);

        // now that the camera was updated, reset where the
        // rotation will start for the next time this function is
        // called.
        rotationStartCoords = [x,y];
    }
}

function mouseScroll (evt) {
    var value = evt.deltaY * zoomingSensitivityFactor;
    console.log("zooming value: " + value)

    if ( value > 0) {
        scene.getCamera().goFarther(value);
    } else if ( value < 0 ) {
        scene.getCamera().goCloser(-value);
    };

}

//Calculates the current X coordinate of the mouse in the client window
function calcRelativeMouseX(evt)
{
    return 2 * (evt.clientX / evt.target.width) - 1;
}

//Calculates the current Y coordinate of the mouse in the client window
function calcRelativeMouseY(evt)
{
    return 2 * (evt.clientY / evt.target.height) - 1;
}

function canvasMain(canvasName){

    scene = new c3dl.Scene();
    scene.setCanvasTag(canvasName);

    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);

    scene.setRenderer(renderer);
    scene.init(canvasName);

    if(renderer.isReady() )
    {
        var theDiv = document.getElementById("buttons");
        var max = parseInt(document.getElementById("numDucks").value);
        var x = -2; // Used to toggle between spawning a duck left or right relative to the origin
        for (var i = 0; i < max; ++i) {
            var instance = duck.instances[i] = new c3dl.Collada();
            instance.init(duck.paths.model);
            instance.setTexture(duck.paths.texture);
            instance.yaw(Math.PI / 2);
            scene.addObjectToScene(instance);

            theDiv.innerHTML += '<input type="button" value="' + i + '" onClick="duck.setPicked(duck.instances[' + i + '])">';
        };
        document.getElementById("initializers").innerHTML = "";

        theDiv = document.getElementById("formations");
        // Make fomration buttons
        for (var func in formations) {
            theDiv.innerHTML += '<input type="button" value="' + func.toString().replace("_", " ") + '" onClick="formations.' + func + '()">';
        };

        var cam = new c3dl.OrbitCamera();
        cam.setFarthestDistance(3000);
        cam.setClosestDistance(60);
        cam.setOrbitPoint([0.0, duck.height, 0.0]);
        cam.setDistance(600);
        scene.setCamera(cam);

        scene.setMouseCallback(mouseUp, mouseDown, mouseMove, mouseScroll);

        scene.startScene();
        scene.setPickingCallback(pickHandler);
        scene.setUpdateCallback(update);
    }
}

function pickHandler (result) {
    var objects = result.getObjects();
    if (result.getButtonUsed() != 1 && objects.length <= 0) {
        return;
    };
    duck.setPicked(objects[0]);
}

function update (elapsedMilliseconds) {
    var fpsDisplay = document.getElementById("fps");
    fpsDisplay.innerHTML = scene.getFPS();
}

function square () {
    
}

function line () {
    
}
