function Object(gl, path) {
	var gl = gl;
	
	this.model = new Model(gl);
	this.model.loadModel(path);
	
	this.material = new Material();
	
	this.scale = vec3.fromValues(1, 1, 1);
	this.rotation = quat.create();
	this.position = vec3.create();
	
	this.getTransform = function() {
		var m_scale = mat4.create();
		m_scale = mat4.fromScaling(m_scale, this.scale);
		var m_rotation = mat4.create();
		m_rotation = mat4.fromQuat(m_rotation, this.rotation);
		var m_translation = mat4.create();
		m_translation = mat4.fromTranslation(m_translation, this.position);
		
		var transform = mat4.create();
		mat4.multiply(transform, transform, m_translation);
		mat4.multiply(transform, transform, m_rotation);
		mat4.multiply(transform, transform, m_scale);
		
		return transform;
	};
	
	this.render = function(shader) {		
		this.model.render(shader);
	};
}