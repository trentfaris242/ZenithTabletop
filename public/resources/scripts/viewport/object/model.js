function Model(gl) {
	var gl = gl;
	
	this.meshes = [];
	
	this.loadModel = function(path) {
		var req = new XMLHttpRequest();
		var self = this;
		req.onreadystatechange = function() {
			if (req.readyState == 4 && (req.status == 0 || req.status == 200)) {
				try {
					var res = parseOBJ(self, req.responseText);
					if (res != "") {
						throw res;
					}
				} catch (err) {
					alert("Error: " + err);
				}				
			} else {
				console.log("Status: " + req.statusText);
			}
		}
		req.open("GET", path, true);
		req.send();
	};
	
	function parseOBJ(self, data) {
		var lines = data.split("\n");
		
		var currentMesh = null;
		var vertices = [];
		var uvs = [];
		var normals = [];
		var unpackedVertices = [];
		var unpackedUVs = [];
		var unpackedNormals = [];
		var indices = [];
		var hashIndices = [];
		var index = 0;
		
		for (var i = 0; i < lines.length; i++) {
			var words = lines[i].trim().split(" ");
			
			// Skip comments
			if (words[0] == "#") {
				continue;
			}
			
			// Skip materials
			else if (words[0] == "mtllib" || words[0] == "usemtl") {
				continue;
			}
			
			// Skip shading
			else if (words[0] == "s") {
				continue;
			}
			
			// Skip groups
			else if (words[0] == "g") {
				continue;
			}
			
			// Skip parameter space vertices
			else if (words[0] == "vp") {
				continue;
			}
			
			// If row is a mesh definition
			else if (words[0] == "o") {
				// If row is not the first mesh definition in this file, store the last mesh
				if (currentMesh != null) {
					self.meshes = [];
					return "Multiple meshes are not supported at this time.";
					
					// Verify correct format
					if (!(unpackedVertices.length * 2 == unpackedUVs.length * 3 && unpackedUVs.length * 3 == unpackedNormals.length * 2)) {
						self.meshes = [];
						return "OBJ file is not properly formatted.";
					}
					if (unpackedVertices.length == 0 || unpackedUVs.length == 0 || unpackedNormals.length == 0) {
						self.meshes = [];
						return "OBJ file is not properly formatted.";
					}
					
					if (unpackedVertices.length % 3 != 0) {
						self.meshes = [];
						return "Vertex does not have 3-dimensional elements.";
					}
					if (unpackedUVs.length % 2 != 0) {
						self.meshes = [];
						return "Texture coordinate does not have 2-dimensional elements.";
					}
					if (unpackedNormals.length % 3 != 0) {
						self.meshes = [];
						return "Normal does not have 3-dimensional elements.";
					}
					
					currentMesh.vertices = unpackedVertices;
					currentMesh.uvs = unpackedUVs;
					currentMesh.normals = unpackedNormals;
					
					// Store the indices in the mesh
					currentMesh.indices = indices;
					
					// Initialize the meshes buffers
					currentMesh.initBuffers();
					
					// Store the mesh
					self.meshes.push(currentMesh);
					
					// Reset all variables
					vertices = [];
					uvs = [];
					normals = [];
					unpackedVertices = [];
					unpackedUVs = [];
					unpackedNormals = [];
					indices = [];
					hashIndices = [];
					index = 0;
				}
				
				// Create a new mesh
				currentMesh = new Mesh(gl);
			}
			
			// If row is a vertex
			else if (words[0] == "v") {
				// Verify correct format
				if (words.length != 4) {
					self.meshes = [];
					return "Vertex does not have 3 elements.";
				}
				
				vertices.push(words[1]);
				vertices.push(words[2]);
				vertices.push(words[3]);
			}
			
			// If row is a uv
			else if (words[0] == "vt") {
				// Verify correct format
				if (words.length != 3) {
					self.meshes = [];
					return "Texture coordinate does not have 2 elements.";
				}
				
				uvs.push(words[1]);
				uvs.push(words[2]);
			}
			
			// If row is a normal
			else if (words[0] == "vn") {
				// Verify correct format
				if (words.length != 4) {
					self.meshes = [];
					return "Normal does not have 3 elements.";
				}
				
				normals.push(words[1]);
				normals.push(words[2]);
				normals.push(words[3]);
			}
			
			// If row is a face
			else if (words[0] == "f") {
				// Verify correct format
				if (words.length != 4) {
					self.meshes = [];
					return "Face does not have 3 elements.";
				}
				
				for (var j = 1; j < words.length; j++) {
					if (words[j] in hashIndices) {
						indices.push(hashIndices[words[j]]);
					} else {
						var vertex = words[j].split("/");
					
						// Verify correct format
						if (vertex.length != 3) {
							self.meshes = [];
							return "Face does not have 3 elements.";
						}
					
						// Verify correct format
						if (vertex[0] > vertices.length) {
							self.meshes = [];
							return "Face's vertex's vertex is out of range.";
						}
						if (vertex[1] > uvs.length) {
							self.meshes = [];
							return "Face's vertex's texture coordinate is out of range.";
						}
						if (vertex[2] > normals.length) {
							self.meshes = [];
							return "Face's vertex's normal is out of range.";
						}
					
						unpackedVertices.push(vertices[(vertex[0] - 1) * 3 + 0]);
						unpackedVertices.push(vertices[(vertex[0] - 1) * 3 + 1]);
						unpackedVertices.push(vertices[(vertex[0] - 1) * 3 + 2]);
					
						if (vertex[1] == "") {
							unpackedUVs.push(-1);
							unpackedUVs.push(-1);
						} else {
							unpackedUVs.push(uvs[(vertex[1] - 1) * 2 + 0]);
							unpackedUVs.push(uvs[(vertex[1] - 1) * 2 + 1]);
						}
					
						unpackedNormals.push(normals[(vertex[2] - 1) * 3 + 0]);
						unpackedNormals.push(normals[(vertex[2] - 1) * 3 + 1]);
						unpackedNormals.push(normals[(vertex[2] - 1) * 3 + 2]);
					
						hashIndices[words[j]] = index;
						indices.push(index);
						index += 1;
					}
				}
			}
			
			// Sometimes last row is a black space
			else if (words[0] == "") {
				continue;
			}
			
			// If row is unknown, throw error
			else {
				self.meshes = [];
				return "Unknown attribute: " + words[0];
			}
		}
				
		// After last row, store last mesh
		if (currentMesh != null) {
			// Verify correct format
			if (!(unpackedVertices.length * 2 == unpackedUVs.length * 3 && unpackedUVs.length * 3 == unpackedNormals.length * 2)) {
				self.meshes = [];
				return "OBJ file is not properly formatted.";
			}
			if (unpackedVertices.length == 0 || unpackedUVs.length == 0 || unpackedNormals.length == 0) {
				self.meshes = [];
				return "OBJ file is not properly formatted.";
			}
			
			if (unpackedVertices.length % 3 != 0) {
				self.meshes = [];
				return "Vertex does not have 3-dimensional elements.";
			}
			if (unpackedUVs.length % 2 != 0) {
				self.meshes = [];
				return "Texture coordinate does not have 2-dimensional elements.";
			}
			if (unpackedNormals.length % 3 != 0) {
				self.meshes = [];
				return "Normal does not have 3-dimensional elements.";
			}
			
			currentMesh.vertices = unpackedVertices;
			currentMesh.uvs = unpackedUVs;
			currentMesh.normals = unpackedNormals;
			
			// Store the indices in the mesh
			currentMesh.indices = indices;
			
			// Initialize the meshes buffers
			currentMesh.initBuffers();
			
			// Store the mesh
			self.meshes.push(currentMesh);
		}
		
		return "";
	}
	
	this.render = function(shader) {
		for (var i = 0; i < this.meshes.length; i++) {
			this.meshes[i].render(shader);
		}
	};
}