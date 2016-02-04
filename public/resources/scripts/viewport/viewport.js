var gl;
var camera;
var objects = [];
var prevTime = new Date().getTime();
var timeElapsed = 0;
var prevFrames = 0;
var curFrames = 0;

function viewport() {
	var canvas = document.getElementById("viewport");
	gl = initWebGL(canvas);
	
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it!");
		return;
	}
	
	initRender();
	initShaders();
	initInput();
	
	camera = new Camera();
	camera.setCamPos(vec3.fromValues(0, 0.5, 5));
	
	var plane = new Object("/resources/assets/plane.obj");
	var planeMaterial = new Material();
	planeMaterial.diffuse = vec3.fromValues(0.75, 1, 0.75);
	planeMaterial.specular = vec3.fromValues(0.25, 0.25, 0.25);
	planeMaterial.shininess = 32.0;
	plane.material = planeMaterial;
	plane.scale = vec3.fromValues(2, 2, 2);
	
	objects.push(plane);
	
	var cube = new Object("/resources/assets/cube.obj");
	var cubeMaterial = new Material();
	cubeMaterial.diffuse = vec3.fromValues(1, 0.5, 0.5);
	cubeMaterial.specular = vec3.fromValues(0.5, 0.5, 0.5);
	cubeMaterial.shininess = 32.0;
	cube.material = cubeMaterial;
	cube.position = vec3.fromValues(0, 0.5, 0);
	
	objects.push(cube);
	
	tick();
}

function initWebGL(canvas) {
	gl = null;
	
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
	
	requestAnimFrame(tick);
	handleKeys(deltaTime);
	camera.update();
	render();
}