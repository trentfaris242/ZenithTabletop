var render = null;
var world = null;

var prevTime = new Date().getTime();
var timeElapsed = 0;
var prevFrames = 0;
var curFrames = 0;

function viewport() {
	var canvas = document.getElementById("viewport");
	var gl = initWebGL(canvas);
	
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it!");
		return;
	}
	
	render = new Render(gl);
	world = new World(gl);
	
	// None of this is required for the engine to function
	// We can set whatever values we want here to customize the demo
	world.getCamera().setCamPos(vec3.fromValues(0, 0.5, 5));
	
	var plane = new Object(gl, "/resources/assets/plane.obj");
	var planeMaterial = new Material();
	planeMaterial.diffuse = vec3.fromValues(0.75, 1, 0.75);
	planeMaterial.specular = vec3.fromValues(0.25, 0.25, 0.25);
	planeMaterial.shininess = 32.0;
	plane.material = planeMaterial;
	plane.scale = vec3.fromValues(2, 2, 2);
	world.spawn(plane);
	
	var cube = new Object(gl, "/resources/assets/cube.obj");
	var cubeMaterial = new Material();
	cubeMaterial.diffuse = vec3.fromValues(1, 0.5, 0.5);
	cubeMaterial.specular = vec3.fromValues(0.5, 0.5, 0.5);
	cubeMaterial.shininess = 32.0;
	cube.material = cubeMaterial;
	cube.position = vec3.fromValues(0, 0.5, 0);
	world.spawn(cube);
		
	tick();
}

function initWebGL(canvas) {
	var gl = null;
	
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch (ex) {
		// TODO
	}
	
	return gl;
}

function tick() {
	var currentTime = new Date().getTime();
	var deltaTime = currentTime - prevTime;
	prevTime = currentTime;
	timeElapsed += deltaTime;
	curFrames++;
	
	if (timeElapsed >= 1000) {
		timeElapsed -= 1000;
		var fpsElement = document.getElementById("fps");
		var fpsText = document.createTextNode(curFrames);
		fpsElement.innerText = fpsText.textContent;
		prevFrames = curFrames;
		curFrames = 0;
	}
	
	var xElement = document.getElementById("x");
	var xText = document.createTextNode((world.getCamera().getPos()[0]).toFixed(3));
	xElement.innerText = xText.textContent;
	var yElement = document.getElementById("y");
	var yText = document.createTextNode((world.getCamera().getPos()[1]).toFixed(3));
	yElement.innerText = yText.textContent;
	var zElement = document.getElementById("z");
	var zText = document.createTextNode((world.getCamera().getPos()[2]).toFixed(3));
	zElement.innerText = zText.textContent;
	
	requestAnimFrame(tick);
	world.update(deltaTime);
	render.render(world);
}