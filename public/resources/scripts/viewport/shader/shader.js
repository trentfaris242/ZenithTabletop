var shaderProgram;

function initShaders() {
	var vertexShader = getShader(gl, "shader-vs");
	var fragmentShader = getShader(gl, "shader-fs");
	
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	
	if (!shaderScript) {
		return null;
	}
	
	var theSource = "";
	var currentChild = shaderScript.firstChild;
		
	while (currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
			theSource += currentChild.textContent;
		}
		
		currentChild = currentChild.nextSibling;
	}
		
	var shader;
	if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else {
		return null;
	}
	
	gl.shaderSource(shader, theSource);
	
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shader: " + gl.getShaderInfoLog(shader));
		return null;
	}
	
	return shader;
}