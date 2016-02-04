function Camera() {
	var pos = vec3.create();
	this.direction = vec3.fromValues(0, 0, -1);
	var target = vec3.create();
	vec3.add(target, pos, this.direction);
	var up = vec3.fromValues(0, 1, 0);
	this.orientation = quat.create();
	
	this.fov = 60.0;
	this.near = 0.1;
	this.far = 100.0;
	
	var view = mat4.create();
	var projection = mat4.create();
	
	this.update = function() {
		vec3.add(target, pos, this.direction);
		mat4.lookAt(view, pos, target, up);
		mat4.perspective(projection, glMatrix.toRadian(this.fov), gl.canvas.width / gl.canvas.height, this.near, this.far);
	};
	
	this.getPos = function() {
		return pos;
	};
	
	this.getTarget = function() {
		return target;
	};
	
	this.getUp = function() {
		return up;
	};
	
	this.getView = function() {
		return view;
	};
	
	this.getProjection = function() {
		return projection;
	};
	
	this.setCamPos = function(p) {
		pos = p;
		vec3.add(target, pos, this.direction);
	};
}