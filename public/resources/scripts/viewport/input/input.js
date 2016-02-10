function Input(gl) {
	var gl = gl;
	
	var camera;
	var currentlyPressedKeys = {};
	var stepSpeed = 4.0;
	var pointerLocked = false;
	var leftMouseDown = false;
	var rightMouseDown = false;
	var lastMouseX;
	var lastMouseY;
	var turnSpeed = 0.0025;
		
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	gl.canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;

	this.update = function(cam, deltaTime) {
		// Update the input's "camera pointer"
		camera = cam;
		
		var newPos = camera.getPos();
		
		// W key
		if (currentlyPressedKeys[87]) {
			var step = camera.direction;
			var scaledStep = vec3.create();
			vec3.scale(scaledStep, step, deltaTime / 1000 * stepSpeed);
			vec3.add(newPos, newPos, scaledStep);
		}
	
		// S key
		if (currentlyPressedKeys[83]) {
			var step = camera.direction;
			var scaledStep = vec3.create();
			vec3.scale(scaledStep, step, deltaTime / 1000 * stepSpeed);
			vec3.subtract(newPos, newPos, scaledStep);
		}
	
		// A key
		if (currentlyPressedKeys[65]) {
			var step = camera.direction;
			var crossStep = vec3.create();
			vec3.cross(crossStep, step, camera.getUp());
			var scaledStep = vec3.create();
			vec3.scale(scaledStep, crossStep, deltaTime / 1000 * stepSpeed);
			vec3.subtract(newPos, newPos, scaledStep);
		}
	
		// D key
		if (currentlyPressedKeys[68]) {
			var step = camera.direction;
			var crossStep = vec3.create();
			vec3.cross(crossStep, step, camera.getUp());
			var scaledStep = vec3.create();
			vec3.scale(scaledStep, crossStep, deltaTime / 1000 * stepSpeed);
			vec3.add(newPos, newPos, scaledStep);
		}
	
		// SPACE key
		if (currentlyPressedKeys[32]) {
			var step = camera.getUp();
			var scaledStep = vec3.create();
			vec3.scale(scaledStep, step, deltaTime / 1000 * stepSpeed);
			vec3.add(newPos, newPos, scaledStep);
		}
	
		// LSHIFT key
		if (currentlyPressedKeys[16]) {
			var step = camera.getUp();
			var scaledStep = vec3.create();
			vec3.scale(scaledStep, step, deltaTime / 1000 * stepSpeed);
			vec3.subtract(newPos, newPos, scaledStep);
		}
		
		if (newPos[0] < -10) {
			newPos[0] = -10;
		} else if (newPos[0] > 10) {
			newPos[0] = 10;
		}
		if (newPos[1] < 0.1) {
			newPos[1] = 0.1;
		} else if (newPos[1] > 10) {
			newPos[1] = 10;
		}
		if (newPos[2] < -10) {
			newPos[2] = -10;
		} else if (newPos[2] > 10) {
			newPos[2] = 10;
		}
		camera.setCamPos(newPos);
	};

	function handleKeyDown(event) {
		currentlyPressedKeys[event.keyCode] = true;
	}

	function handleKeyUp(event) {
		currentlyPressedKeys[event.keyCode] = false;
	}

	function handleMouseDown(event) {
		if (pointerLocked) {
			// Handle mouse click while pointer locked
		} else {
			var havePointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
			// If this browser can have pointer locked, request it
			if (havePointerLock) {
				gl.canvas.requestPointerLock = gl.canvas.requestPointerLock || gl.canvas.mozRequestPointerLock || gl.canvas.webkitRequestPointerLock;
				document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
			
				gl.canvas.requestPointerLock();
				document.addEventListener("pointerlockchange", handleLockChange, false);
				document.addEventListener("mozpointerlockchange", handleLockChange, false);
				document.addEventListener("webkitpointerlockchange", handleLockChange, false);
			}
		}
	
		if (event.button == 0) {
			leftMouseDown = true;
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		}
		if (event.button == 2) {
			rightMouseDown = true;
			camera.fov = 30.0;
		}
	}

	function handleMouseUp(event) {
		if (event.button == 0) {
			leftMouseDown = false;
		}
		if (event.button == 2) {
			rightMouseDown = false;
			camera.fov = 60.0;
		}
	}

	function handleMouseMove(event) {
		if (!leftMouseDown && !pointerLocked) {
			return;
		}
	
		var newX, newY;
		if (pointerLocked) {
			var movementX = event.movementX || event.mozMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || 0;
			newX = lastMouseX + movementX;
			newY = lastMouseY + movementY;
		} else {
			newX = event.clientX;
			newY = event.clientY;
		}
		
		var deltaX = (lastMouseX - newX) * turnSpeed;
		var deltaY = (lastMouseY - newY) * turnSpeed;
				
		vec3.transformQuat(camera.direction, vec3.fromValues(0, 0, -1), camera.orientation);
		var forward = vec3.fromValues(camera.direction[0], 0, camera.direction[2]);
		vec3.normalize(forward, forward);
		var right = vec3.create();
		vec3.cross(right, forward, camera.getUp());
	
		var yaw_quat = quat.create();
		quat.setAxisAngle(yaw_quat, camera.getUp(), deltaX);
		var pitch_quat = quat.create();
		quat.setAxisAngle(pitch_quat, right, deltaY);
	
		quat.multiply(camera.orientation, yaw_quat, camera.orientation);
		quat.multiply(camera.orientation, pitch_quat, camera.orientation);
		
		lastMouseX = newX;
		lastMouseY = newY;
	}

	function handleLockChange() {
		if (document.pointerLockElement === gl.canvas || document.mozPointerLockElement === gl.canvas || document.webkitPointerLockElement) {
			pointerLocked = true;
		} else {
			pointerLocked = false;
		}
	}
}