duck = {
    paths : {
        model : "../../../assets/models/duck/duck.dae",
        texture : "../../../assets/models/duck/duck.png"
    },
    instances : [],
    angularVelOnClick : [ 0, 0.001, 0 ],
    activelyRotating : null,
    width : 75,
    height : 100,
    formationPaddingFactor : 2.5,
    pickedCallback : null,

    // methods
    setPicked : function(d){
        function helper(d)
        {
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
        helper(d);
        if (duck.pickedCallback != null) {
            duck.pickedCallback({ duck : d, picked : d != null });
        };
    },
    getFormationWidth : function(){
        return duck.width * duck.formationPaddingFactor;
    }
};

var formations = {
    line : function(){
        var width = 0;
        var sign = -1;
        for (var i = 0; i < duck.instances.length; i++, sign = -sign) {
            var instance = duck.instances[i];
            var newPos = [ width * sign, 0, 0 ];
            instance.setPosition(newPos);

            if ( sign < 0 ) {
                width += duck.getFormationWidth();
            };
        };
    },
    square : function(){
        var rows = columns = Math.round(Math.sqrt(duck.instances.length));
        if (rows * columns < duck.instances.length) {
            ++rows;
        };

        var sign = -1;
        var width = 0;
        var i = 0;
        for (var row = 0; row < rows && i < duck.instances.length; ++row) {
            for (var col = 0; col < columns && i < duck.instances.length; ++col, ++i, sign = -sign) {
                var instance = duck.instances[ i ];
                var newPos = [ sign * width, 0, row * duck.getFormationWidth() ];
                ("duck #" + i + "'s new position: " + newPos);
                instance.setPosition(newPos);
                if (sign < 0) {
                    width += duck.getFormationWidth();
                };
            };
            sign = -1;
            width = 0;
        };
    },
    rectangle : function(){
        var rows = columns = Math.round(Math.sqrt(duck.instances.length));
        if (rows * columns < duck.instances.length) {
            ++rows;
        };
        // Make it more rectangley
        if (rows > columns) {
            var temp = rows;
            rows = columns;
            columns = temp;
        };

        var sign = -1;
        var width = 0;
        var i = 0;
        for (var row = 0; row < rows && i < duck.instances.length; ++row) {
            for (var col = 0; col < columns && i < duck.instances.length; ++col, ++i, sign = -sign) {
                var instance = duck.instances[ i ];
                var newPos = [ sign * width, 0, row * duck.getFormationWidth() * 0.9 ];
                instance.setPosition(newPos);
                if (sign < 0) {
                    width += duck.getFormationWidth() * 1.6;
                };
            };
            sign = -1;
            width = 0;
        };
    },
    wedge : function(){

        var width = 0;
        var sign = -1;
        var maxDucksPerRow = 1;
        var currentRow = 0;
        var currentDucksInRow = 0;
        for (var i = 0; i < duck.instances.length; i++, sign = -sign) {
            var instance = duck.instances[i];
            var newPos = [ width * sign, 0, currentRow * duck.getFormationWidth() ];
            instance.setPosition(newPos);

            if ( sign < 0 ) {
                width += duck.getFormationWidth();
            };

            ++currentDucksInRow;
            if (currentDucksInRow >= maxDucksPerRow) {
                width = 0;
                sign = 1;
                maxDucksPerRow += 2;
                ++currentRow;
                currentDucksInRow = 0;
            };
        };
    },
    the_v : function(){
        var maxDucksPerRow = 2;
        var currentDucksInRow = 1;
        var currentRow = 0;
        var x = -duck.formationPaddingFactor;
        for (var i = 0; i < duck.instances.length; i++, x = -x) {
            var instance = duck.instances[i];
            var newPos = [ currentRow * duck.width * x, 0, currentRow * duck.getFormationWidth() ];
            instance.setPosition(newPos);

            ++currentDucksInRow;
            if ( currentDucksInRow >= maxDucksPerRow ) {
                ++currentRow;
                currentDucksInRow = 0;
            };
        };
    }
}

function go (theName) {
    canvasMain(theName);
}

c3dl.addModel(duck.paths.model);

var isDragging = false;
var rotationStartCoords = [0,0]; //The mouse coordinates at the beginning of a rotation
var SENSITIVITY = 0.7;
var zoomingSensitivityFactor = 0.5;

var mouse = {
    up : function(evt)
    {
        if(evt.which == 1) {
            isDragging = false;
        };
        evt.stopPropagation();
    },
    down : function(evt)
    {
        if(evt.which == 1) {
            isDragging = true;
            rotationStartCoords[0] = calcRelativeMouseX(evt);
            rotationStartCoords[1] = calcRelativeMouseY(evt);
        }
    },
    move : function(evt)
    {
        if(isDragging)
        {
            var cam = scene.getCamera();
            var x = calcRelativeMouseX(evt);
            var y = calcRelativeMouseY(evt);

            var deltaX = x - rotationStartCoords[0];
            var deltaY = y - rotationStartCoords[1];

            cam.yaw(-deltaX * SENSITIVITY);
            cam.pitch(deltaY * SENSITIVITY);

            rotationStartCoords = [x,y];
        }
    },
    scroll : function(evt) {
        var value = evt.deltaY * zoomingSensitivityFactor;

        if ( value > 0) {
            scene.getCamera().goFarther(value);
        } else if ( value < 0 ) {
            scene.getCamera().goCloser(-value);
        };
    }
}

var key = {
    up : function(evt){
        keyDownEvent = evt;
    },
    down : function(evt){
        keyUpEvent = evt;
    }
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
        var numDucks = parseInt(document.getElementById("numDucks").value);
        console.log("Creating " + numDucks + " ducks.");
        var x = -2; // Used to toggle between spawning a duck left or right relative to the origin
        for (var i = 0; i < numDucks; ++i) {
            var instance = duck.instances[i] = new c3dl.Collada();
            instance.init(duck.paths.model);
            instance.setTexture(duck.paths.texture);
            instance.yaw(Math.PI / 2);
            instance.duckID = i;
            scene.addObjectToScene(instance);

            theDiv.innerHTML += '<input type="button" value="' + i + '" onClick="duck.setPicked(duck.instances[' + i + '])">';
        };
        document.getElementById("initializers").innerHTML = "";

        theDiv = document.getElementById("formations");
        // Make fomration buttons
        for (var func in formations) {
            theDiv.innerHTML += '<input type="button" value="' + func.toString().replace("_", " ") + '" onClick="formations.' + func + '()">';
        };

        // Initial formation for the ducks
        formations.line();

        var cam = new c3dl.OrbitCamera();
        cam.setFarthestDistance(3000);
        cam.setClosestDistance(60);
        cam.setOrbitPoint([0.0, duck.height, duck.getFormationWidth()]);
        cam.setDistance(600);
        scene.setCamera(cam);

        scene.setMouseCallback(mouse.up, mouse.down, mouse.move, mouse.scroll);
        scene.setKeyboardCallback(key.up, key.down);

        scene.startScene();
        scene.setPickingCallback(pickHandler);
        scene.setUpdateCallback(update);
    }
}

function pickHandler (result) {
    // Only allow picking with the left mouse button
    if (result.getButtonUsed() != 1) {
        return;
    };

    var objects = result.getObjects();
    if (objects.length <= 0) {
        return;
    };
    console.log("Picked duck #" + objects[0].duckID)
    duck.setPicked(objects[0]);
}

function update (elapsedMilliseconds) {
    var fpsDisplay = document.getElementById("fps");
    fpsDisplay.innerHTML = scene.getFPS();
}
