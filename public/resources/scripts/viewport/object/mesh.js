function Mesh() {
	this.vertices = [];
	this.uvs = [];
	this.normals = [];
	this.indices = [];
	
	this.VBO = null;
	this.TBO = null;
	this.NBO = null;
	this.IBO = null;
	
	this.initBuffers = function() {
		this.VBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.VBO.itemSize = 3;
		this.VBO.numItems = this.vertices.length / this.VBO.itemSize;

		this.TBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.TBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
		this.TBO.itemSize = 2;
		this.TBO.numItems = this.uvs.length / this.TBO.itemSize;
		
		this.NBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.NBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
		this.NBO.itemSize = 3;
		this.NBO.numItems = this.normals.length / this.NBO.itemSize;
		
		this.IBO = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBO);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
		this.IBO.itemSize = 1;
		this.IBO.numItems = this.indices.length / this.IBO.itemSize;
	};
	
	this.render = function() {		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VBO.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.TBO);
		gl.vertexAttribPointer(shaderProgram.vertexUVAttribute, this.TBO.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.NBO);
		gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.NBO.itemSize, gl.FLOAT, false, 0, 0);
				
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBO);
		gl.drawElements(gl.TRIANGLES, this.IBO.numItems, gl.UNSIGNED_SHORT, 0);
	};
}