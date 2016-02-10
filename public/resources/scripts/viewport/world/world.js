function World(gl) {
	var gl = gl;
	
	var input = new Input(gl);
	var shader = new Shader(gl);
	var camera = new Camera(gl);
	var objects = [];
	
	this.update = function(deltaTime) {
		input.update(camera, deltaTime);
		camera.update();
	};
	
	this.render = function() {
		for (var i = 0; i < objects.length; i++) {
			gl.useProgram(shader.getShaderProgram());
		
			shader.getShaderProgram().vertexPositionAttribute = gl.getAttribLocation(shader.getShaderProgram(), "posVertex");
			gl.enableVertexAttribArray(shader.getShaderProgram().vertexPositionAttribute);
		
			shader.getShaderProgram().vertexUVAttribute = gl.getAttribLocation(shader.getShaderProgram(), "uvVertex");
			gl.enableVertexAttribArray(shader.getShaderProgram().vertexUVAttribute);
		
			shader.getShaderProgram().vertexNormalAttribute = gl.getAttribLocation(shader.getShaderProgram(), "normalVertex");
			gl.enableVertexAttribArray(shader.getShaderProgram().vertexNormalAttribute);
	
			var mvp = mat4.create();
			mat4.multiply(mvp, mvp, camera.getProjection());
			mat4.multiply(mvp, mvp, camera.getView());
			mat4.multiply(mvp, mvp, objects[i].getTransform());
	
			var mvpLocation = gl.getUniformLocation(shader.getShaderProgram(), "mvp");
			gl.uniformMatrix4fv(mvpLocation, false, mvp);
		
			var modelLocation = gl.getUniformLocation(shader.getShaderProgram(), "model");
			gl.uniformMatrix4fv(modelLocation, false, objects[i].getTransform());
		
			var mv = mat4.create();
			mat4.multiply(mv, mv, camera.getView());
			mat4.multiply(mv, mv, objects[i].getTransform());
			var normal = mat3.create();
			mat3.normalFromMat4(normal, objects[i].getTransform());
		
			var normalLocation = gl.getUniformLocation(shader.getShaderProgram(), "normal");
			gl.uniformMatrix3fv(normalLocation, false, normal);
		
			var materialLocation = {};
			materialLocation.diffuse = gl.getUniformLocation(shader.getShaderProgram(), "material.diffuse");
			materialLocation.specular = gl.getUniformLocation(shader.getShaderProgram(), "material.specular");
			materialLocation.shininess = gl.getUniformLocation(shader.getShaderProgram(), "material.shininess");
			gl.uniform3f(materialLocation.diffuse, objects[i].material.diffuse[0], objects[i].material.diffuse[1], objects[i].material.diffuse[2]);
			gl.uniform3f(materialLocation.specular, objects[i].material.specular[0], objects[i].material.specular[1], objects[i].material.specular[2]);
			gl.uniform1f(materialLocation.shininess, objects[i].material.shininess);
			
			var directionalLight = new DirectionalLight();
			directionalLight.direction = vec3.fromValues(-1, -1, -1);
			directionalLight.ambient = vec3.fromValues(0.1, 0.1, 0.1);
			directionalLight.diffuse = vec3.fromValues(1, 1, 1);
			directionalLight.specular = vec3.fromValues(1, 1, 1);
		
			var directionalLightLocation = {};
			directionalLightLocation.direction = gl.getUniformLocation(shader.getShaderProgram(), "directionalLight.direction");
			directionalLightLocation.ambient = gl.getUniformLocation(shader.getShaderProgram(), "directionalLight.ambient");
			directionalLightLocation.diffuse = gl.getUniformLocation(shader.getShaderProgram(), "directionalLight.diffuse");
			directionalLightLocation.specular = gl.getUniformLocation(shader.getShaderProgram(), "directionalLight.specular");
			gl.uniform3f(directionalLightLocation.direction, directionalLight.direction[0], directionalLight.direction[1], directionalLight.direction[2]);
			gl.uniform3f(directionalLightLocation.ambient, directionalLight.ambient[0], directionalLight.ambient[1], directionalLight.ambient[2]);
			gl.uniform3f(directionalLightLocation.diffuse, directionalLight.diffuse[0], directionalLight.diffuse[1], directionalLight.diffuse[2]);
			gl.uniform3f(directionalLightLocation.specular, directionalLight.specular[0], directionalLight.specular[1], directionalLight.specular[2]);
		
			var viewPositionLocation = gl.getUniformLocation(shader.getShaderProgram(), "viewPosition");
			gl.uniform3f(viewPositionLocation, camera.getPos()[0], camera.getPos()[1], camera.getPos()[2]);
		
			objects[i].render(shader);
		}
	};
	
	this.spawn = function(object) {
		objects.push(object);
	};
	
	this.getCamera = function() {
		return camera;
	};
}