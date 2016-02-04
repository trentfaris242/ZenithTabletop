var directionalLight;

function initRender() {
	gl.clearColor(0.9, 0.95, 1, 1);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
	directionalLight = new DirectionalLight();
	directionalLight.direction = vec3.fromValues(-1, -1, -1);
	directionalLight.ambient = vec3.fromValues(0.1, 0.1, 0.1);
	directionalLight.diffuse = vec3.fromValues(1, 1, 1);
	directionalLight.specular = vec3.fromValues(1, 1, 1);
}

function render() {
	resize(gl.canvas);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	for (var i = 0; i < objects.length; i++) {
		gl.useProgram(shaderProgram);
		
		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "posVertex");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		
		shaderProgram.vertexUVAttribute = gl.getAttribLocation(shaderProgram, "uvVertex");
		gl.enableVertexAttribArray(shaderProgram.vertexUVAttribute);
		
		shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "normalVertex");
		gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	
		var mvp = mat4.create();
		mat4.multiply(mvp, mvp, camera.getProjection());
		mat4.multiply(mvp, mvp, camera.getView());
		mat4.multiply(mvp, mvp, objects[i].getTransform());
	
		var mvpLocation = gl.getUniformLocation(shaderProgram, "mvp");
		gl.uniformMatrix4fv(mvpLocation, false, mvp);
		
		var modelLocation = gl.getUniformLocation(shaderProgram, "model");
		gl.uniformMatrix4fv(modelLocation, false, objects[i].getTransform());
		
		var mv = mat4.create();
		mat4.multiply(mv, mv, camera.getView());
		mat4.multiply(mv, mv, objects[i].getTransform());
		var normal = mat3.create();
		mat3.normalFromMat4(normal, objects[i].getTransform());
		
		var normalLocation = gl.getUniformLocation(shaderProgram, "normal");
		gl.uniformMatrix3fv(normalLocation, false, normal);
		
		var materialLocation = {};
		materialLocation.diffuse = gl.getUniformLocation(shaderProgram, "material.diffuse");
		materialLocation.specular = gl.getUniformLocation(shaderProgram, "material.specular");
		materialLocation.shininess = gl.getUniformLocation(shaderProgram, "material.shininess");
		gl.uniform3f(materialLocation.diffuse, objects[i].material.diffuse[0], objects[i].material.diffuse[1], objects[i].material.diffuse[2]);
		gl.uniform3f(materialLocation.specular, objects[i].material.specular[0], objects[i].material.specular[1], objects[i].material.specular[2]);
		gl.uniform1f(materialLocation.shininess, objects[i].material.shininess);
		
		var directionalLightLocation = {};
		directionalLightLocation.direction = gl.getUniformLocation(shaderProgram, "directionalLight.direction");
		directionalLightLocation.ambient = gl.getUniformLocation(shaderProgram, "directionalLight.ambient");
		directionalLightLocation.diffuse = gl.getUniformLocation(shaderProgram, "directionalLight.diffuse");
		directionalLightLocation.specular = gl.getUniformLocation(shaderProgram, "directionalLight.specular");
		gl.uniform3f(directionalLightLocation.direction, directionalLight.direction[0], directionalLight.direction[1], directionalLight.direction[2]);
		gl.uniform3f(directionalLightLocation.ambient, directionalLight.ambient[0], directionalLight.ambient[1], directionalLight.ambient[2]);
		gl.uniform3f(directionalLightLocation.diffuse, directionalLight.diffuse[0], directionalLight.diffuse[1], directionalLight.diffuse[2]);
		gl.uniform3f(directionalLightLocation.specular, directionalLight.specular[0], directionalLight.specular[1], directionalLight.specular[2]);
		
		var viewPositionLocation = gl.getUniformLocation(shaderProgram, "viewPosition");
		gl.uniform3f(viewPositionLocation, camera.getPos()[0], camera.getPos()[1], camera.getPos()[2]);
		
		objects[i].render();
	}
}

function resize(canvas) {
	var displayWidth = canvas.clientWidth;
	var displayHeight = canvas.clientHeight;
	
	if (canvas.width != displayWidth || canvas.height != displayHeight) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}
	
	gl.viewport(0, 0, canvas.width, canvas.height);
}