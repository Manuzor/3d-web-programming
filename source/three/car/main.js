var renderer;
var camera;
var scene;

var car;

function initialize () {
	
	// Create the renderer.
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Create the camera.
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 400;

	// Create the scene instance.
	scene = new THREE.Scene();

	// Create some geometry
	var geometry = new THREE.CubeGeometry(200, 200, 200);

	// Load the texture.
	var texture = THREE.ImageUtils.loadTexture("images/texture0.JPG");
	texture.anisotropy = renderer.getMaxAnisotropy();

	// Create the material
	var material = new THREE.MeshBasicMaterial({map: texture});

	// And finally create the car?
	car = new THREE.Mesh(geometry, material);

	// Add the car to the scene.
	scene.add(car);

	// Add window listener
	window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

initialize();