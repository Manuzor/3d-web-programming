// Tutorial 2: the javascript
// The models used need to be parsed before the page
// render. This code will parse the model files
// and when this is complete the parser will call the
// main. The argument being passed - "tutorial" -
// is the id of the canvas element on the html page.

console.log("Loaded script source correctly.");

var duck = { path : "../../../assets/models/duck/duck.dae" };

c3dl.addMainCallBack(canvasMain, "tutorial");
c3dl.addModel(duck.path);

// The program main
function canvasMain(canvasName)
{
	// Create new c3dl.Scene addObjectToScene
	scn = new c3dl.Scene();
	scn.setCanvasTag(canvasName);

	// Create GL context
	renderer = new c3dl.WebGL();
	renderer.createRenderer(this);

	// Attach renderer to the scene
	scn.setRenderer(renderer);
	scn.init(canvasName);

	//the isReady() function tests whether or not a renderer
	//is attached to a scene.  If the renderer failed to
	//initialize this will return false but only after you
	//try to attach it to a scene.
	if(renderer.isReady())
	{
		// Create a Collada object that
		// will contain a imported
		// model of something to put
		// in the scene.
		duck.model = new c3dl.Collada();

		// If the path is already parsed
		// (as it is in this case)
		// then the model is automatically retrieved
		// from a collada manager.
		duck.model.init(duck.path);

		//duck.model.scale([10, 10, 10]);

		// Give the duck.model a bit of a spin on y
		//duck.model.setAngularVel(new Array(0.0, -0.001, 0.0));

		// Add the object to the scene
		scn.addObjectToScene(duck.model);

		// Create a camera
		var cam = new c3dl.FreeCamera();

		// Place the camera.
		cam.setPosition(new Array(200.0, 300.0, 500.0));

		// Point the camera.
		// Here it is pointed at the same location as
		// the duck.model so the duck.model will appear centered.
		cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));

		// Add the camera to the scene
		scn.setCamera(cam);

		// Start the scene
		scn.startScene();
	}
}