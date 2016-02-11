function ZenithWGL(canvas) {
	var gl = null;
	
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch (ex) {
		alert("ERROR: " + ex);
		return;
	}
	
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it!");
		return;
	}
	
	var render = new Render();
	var world = new World();
	
	var prevTime = new Date().getTime();
	var framesRendered = [];
	tick();
	
	function tick() {
		var currentTime = new Date().getTime();
		var deltaTime = currentTime - prevTime;
		prevTime = currentTime;
		framesRendered.push(currentTime);
		while (framesRendered[0] <= currentTime - 1000) {
			framesRendered.shift();
		}
		
		requestAnimFrame(tick);
		world.update(deltaTime);
		render.render(world);
	}
	
	this.createObject = function(path) {
		return new Object(path);
	};
	
	this.createMaterial = function() {
		return new Material();
	};
	
	this.getRender = function() {
		return render;
	};
	
	this.setRender = function(r) {
		render = r;
	};
	
	this.getWorld = function() {
		return world;
	};
	
	this.setWorld = function(w) {
		world = w;
	};
	
	this.getFPS = function() {
		return framesRendered.length;
	};
	
	function Camera() {
		var position = vec3.create();
		var direction = vec3.fromValues(0, 0, -1);
		var up = vec3.fromValues(0, 1, 0);
		var orientation = quat.create();
	
		var fov = 60.0;
		var near = 0.1;
		var far = 100.0;
	
		var view = mat4.create();
		var projection = mat4.create();
	
		this.update = function() {
			var target = vec3.create();
			vec3.add(target, position, direction);
			mat4.lookAt(view, position, target, up);
			mat4.perspective(projection, glMatrix.toRadian(fov), gl.canvas.width / gl.canvas.height, near, far);
		};
	
		this.getPosition = function() {
			return position;
		};
		
		this.setPosition = function(p) {
			position = p;
		};
		
		this.getDirection = function() {
			return direction;
		};
		
		this.setDirection = function(d) {
			direction = d;
		};
	
		this.getUp = function() {
			return up;
		};
		
		this.setUp = function(u) {
			up = u;
		};
		
		this.getOrientation = function() {
			return orientation;
		};
		
		this.setOrientation = function(o) {
			orientation = o;
		};
		
		this.getFOV = function() {
			return fov;
		};
		
		this.setFOV = function(f) {
			fov = f;
		};
		
		this.getNear = function() {
			return near;
		};
		
		this.setNear = function(n) {
			near = n;
		};
		
		this.getFar = function() {
			return far;
		};
		
		this.setFar = function(f) {
			far = f;
		};
	
		this.getView = function() {
			return view;
		};
	
		this.getProjection = function() {
			return projection;
		};
	}
	
	function DirectionalLight() {
		var direction;
		var ambient;
		var diffuse;
		var specular;
		
		this.getDirection = function() {
			return direction;
		};
		
		this.setDirection = function(d) {
			direction = d;
		};
		
		this.getAmbient = function() {
			return ambient;
		};
		
		this.setAmbient = function(a) {
			ambient = a;
		};
		
		this.getDiffuse = function() {
			return diffuse;
		};
		
		this.setDiffuse = function(d) {
			diffuse = d;
		};
		
		this.getSpecular = function() {
			return specular;
		};
		
		this.setSpecular = function(s) {
			specular = s;
		};
	}
	
	function Input() {
		var camera;
		var currentlyPressedKeys = {};
		var stepSpeed = 4.0;
		var pointerLocked = false;
		var leftMouseDown = false;
		var rightMouseDown = false;
		var lastMouseX;
		var lastMouseY;
		var turnSpeed = 0.0025;
		var mode = 0;
		
		document.onkeydown = handleKeyDown;
		document.onkeyup = handleKeyUp;
		gl.canvas.onmousedown = handleMouseDown;
		document.onmouseup = handleMouseUp;
		document.onmousemove = handleMouseMove;

		this.update = function(cam, deltaTime) {
			camera = cam;
		
			var newPos = camera.getPosition();
		
			// W key
			if (currentlyPressedKeys[87]) {
				var step = camera.getDirection();
				var scaledStep = vec3.create();
				vec3.scale(scaledStep, step, deltaTime / 1000 * stepSpeed);
				vec3.add(newPos, newPos, scaledStep);
			}
	
			// S key
			if (currentlyPressedKeys[83]) {
				var step = camera.getDirection();
				var scaledStep = vec3.create();
				vec3.scale(scaledStep, step, deltaTime / 1000 * stepSpeed);
				vec3.subtract(newPos, newPos, scaledStep);
			}
	
			// A key
			if (currentlyPressedKeys[65]) {
				var step = camera.getDirection();
				var crossStep = vec3.create();
				vec3.cross(crossStep, step, camera.getUp());
				var scaledStep = vec3.create();
				vec3.scale(scaledStep, crossStep, deltaTime / 1000 * stepSpeed);
				vec3.subtract(newPos, newPos, scaledStep);
			}
	
			// D key
			if (currentlyPressedKeys[68]) {
				var step = camera.getDirection();
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
			camera.setPosition(newPos);
		};

		function handleKeyDown(event) {
			if (event.keyCode == 76) {
				mode += 1;
				if (mode > 3) {
					mode -= 4;
				}
			}
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
				camera.setFOV(30.0);
			}
		}

		function handleMouseUp(event) {
			if (event.button == 0) {
				leftMouseDown = false;
			}
			if (event.button == 2) {
				rightMouseDown = false;
				camera.setFOV(60.0);
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
			
			var direction = camera.getDirection();
			vec3.transformQuat(direction, vec3.fromValues(0, 0, -1), camera.getOrientation());
			camera.setDirection(direction);
			var forward = vec3.fromValues(camera.getDirection()[0], 0, camera.getDirection()[2]);
			vec3.normalize(forward, forward);
			var right = vec3.create();
			vec3.cross(right, forward, camera.getUp());
	
			var yaw_quat = quat.create();
			quat.setAxisAngle(yaw_quat, camera.getUp(), deltaX);
			var pitch_quat = quat.create();
			quat.setAxisAngle(pitch_quat, right, deltaY);
	
			var orientation = camera.getOrientation();
			quat.multiply(orientation, yaw_quat, orientation);
			quat.multiply(orientation, pitch_quat, orientation);
			camera.setOrientation(orientation);
		
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
	
		this.getMode = function() {
			return mode;
		};
	}
	
	function Material() {
		var diffuse;
		var specular;
		var shininess;
		
		this.getDiffuse = function() {
			return diffuse;
		};
		
		this.setDiffuse = function(d) {
			diffuse = d;
		};
		
		this.getSpecular = function() {
			return specular;
		};
		
		this.setSpecular = function(s) {
			specular = s;
		};
		
		this.getShininess = function() {
			return shininess;
		};
		
		this.setShininess = function(s) {
			shininess = s;
		};
	}
	
	function Mesh() {	
		var vertices = [];
		var uvs = [];
		var normals = [];
		var indices = [];
	
		var VBO;
		var TBO;
		var NBO;
		var IBO;
	
		this.initBuffers = function() {
			VBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			VBO.itemSize = 3;
			VBO.numItems = vertices.length / VBO.itemSize;

			TBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, TBO);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
			TBO.itemSize = 2;
			TBO.numItems = uvs.length / TBO.itemSize;
		
			NBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, NBO);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
			NBO.itemSize = 3;
			NBO.numItems = normals.length / NBO.itemSize;
		
			IBO = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
			IBO.itemSize = 1;
			IBO.numItems = indices.length / IBO.itemSize;
		};
	
		this.render = function(shader) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
			gl.vertexAttribPointer(shader.getShaderProgram().vertexPositionAttribute, VBO.itemSize, gl.FLOAT, false, 0, 0);
		
			gl.bindBuffer(gl.ARRAY_BUFFER, TBO);
			gl.vertexAttribPointer(shader.getShaderProgram().vertexUVAttribute, TBO.itemSize, gl.FLOAT, false, 0, 0);
		
			gl.bindBuffer(gl.ARRAY_BUFFER, NBO);
			gl.vertexAttribPointer(shader.getShaderProgram().vertexNormalAttribute, NBO.itemSize, gl.FLOAT, false, 0, 0);
				
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
			gl.drawElements(gl.TRIANGLES, IBO.numItems, gl.UNSIGNED_SHORT, 0);
		};
		
		this.getVertices = function() {
			return vertices;
		};
		
		this.setVertices = function(v) {
			vertices = v;
		};
		
		this.getUVs = function() {
			return uvs;
		};
		
		this.setUVs = function(u) {
			uvs = u;
		};
		
		this.getNormals = function() {
			return normals;
		};
		
		this.setNormals = function(n) {
			normals = n;
		};
		
		this.getIndices = function() {
			return indices;
		};
		
		this.setIndices = function(i) {
			indices = i;
		};
	}
	
	function Model(path) {	
		var meshes = [];
	
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
						/* THIS IS TEMPORARY UNTIL MULTIPLE MESHES ARE SUPPORTED */
						self.setMeshes([]);
						return "Multiple meshes are not supported at this time.";
						/*********************************************************/
					
						// Verify correct format
						if (!(unpackedVertices.length * 2 == unpackedUVs.length * 3 && unpackedUVs.length * 3 == unpackedNormals.length * 2)) {
							self.setMeshes([]);
							return "OBJ file is not properly formatted.";
						}
						if (unpackedVertices.length == 0 || unpackedUVs.length == 0 || unpackedNormals.length == 0) {
							self.setMeshes([]);
							return "OBJ file is not properly formatted.";
						}
					
						if (unpackedVertices.length % 3 != 0) {
							self.setMeshes([]);
							return "Vertex does not have 3-dimensional elements.";
						}
						if (unpackedUVs.length % 2 != 0) {
							self.setMeshes([]);
							return "Texture coordinate does not have 2-dimensional elements.";
						}
						if (unpackedNormals.length % 3 != 0) {
							self.setMeshes([]);
							return "Normal does not have 3-dimensional elements.";
						}
					
						currentMesh.setVertices(unpackedVertices);
						currentMesh.setUVs(unpackedUVs);
						currentMesh.setNormals(unpackedNormals);
					
						// Store the indices in the mesh
						currentMesh.setIndices(indices);
					
						// Initialize the meshes buffers
						currentMesh.initBuffers();
					
						// Store the mesh
						self.addMesh(currentMesh);
					
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
					currentMesh = new Mesh();
				}
			
				// If row is a vertex
				else if (words[0] == "v") {
					// Verify correct format
					if (words.length != 4) {
						self.setMeshes([]);
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
						self.setMeshes([]);
						return "Texture coordinate does not have 2 elements.";
					}
				
					uvs.push(words[1]);
					uvs.push(words[2]);
				}
			
				// If row is a normal
				else if (words[0] == "vn") {
					// Verify correct format
					if (words.length != 4) {
						self.setMeshes([]);
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
						self.setMeshes([]);
						return "Face does not have 3 elements.";
					}
				
					for (var j = 1; j < words.length; j++) {
						if (words[j] in hashIndices) {
							indices.push(hashIndices[words[j]]);
						} else {
							var vertex = words[j].split("/");
					
							// Verify correct format
							if (vertex.length != 3) {
								self.setMeshes([]);
								return "Face does not have 3 elements.";
							}
					
							// Verify correct format
							if (vertex[0] > vertices.length) {
								self.setMeshes([]);
								return "Face's vertex's vertex is out of range.";
							}
							if (vertex[1] > uvs.length) {
								self.setMeshes([]);
								return "Face's vertex's texture coordinate is out of range.";
							}
							if (vertex[2] > normals.length) {
								self.setMeshes([]);
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
					self.setMeshes([]);
					return "Unknown attribute: " + words[0];
				}
			}
				
			// After last row, store last mesh
			if (currentMesh != null) {
				// Verify correct format
				if (!(unpackedVertices.length * 2 == unpackedUVs.length * 3 && unpackedUVs.length * 3 == unpackedNormals.length * 2)) {
					self.setMeshes([]);
					return "OBJ file is not properly formatted.";
				}
				if (unpackedVertices.length == 0 || unpackedUVs.length == 0 || unpackedNormals.length == 0) {
					self.setMeshes([]);
					return "OBJ file is not properly formatted.";
				}
			
				if (unpackedVertices.length % 3 != 0) {
					self.setMeshes([]);
					return "Vertex does not have 3-dimensional elements.";
				}
				if (unpackedUVs.length % 2 != 0) {
					self.setMeshes([]);
					return "Texture coordinate does not have 2-dimensional elements.";
				}
				if (unpackedNormals.length % 3 != 0) {
					self.setMeshes([]);
					return "Normal does not have 3-dimensional elements.";
				}
			
				currentMesh.setVertices(unpackedVertices);
				currentMesh.setUVs(unpackedUVs);
				currentMesh.setNormals(unpackedNormals);
			
				// Store the indices in the mesh
				currentMesh.setIndices(indices);
			
				// Initialize the meshes buffers
				currentMesh.initBuffers();
			
				// Store the mesh
				self.addMesh(currentMesh);
			}
		
			return "";
		}
	
		this.render = function(shader) {
			for (var i = 0; i < meshes.length; i++) {
				meshes[i].render(shader);
			}
		};
		
		this.addMesh = function(m) {
			meshes.push(m);
		};
		
		this.getMeshes = function() {
			return meshes;
		};
		
		this.setMeshes = function(m) {
			meshes = m;
		};
	}
	
	function Object(path) {
		var model = new Model(path);
	
		var material = new Material();
	
		var scale = vec3.fromValues(1, 1, 1);
		var rotation = quat.create();
		var position = vec3.create();
	
		this.getTransform = function() {
			var m_scale = mat4.create();
			m_scale = mat4.fromScaling(m_scale, scale);
			var m_rotation = mat4.create();
			m_rotation = mat4.fromQuat(m_rotation, rotation);
			var m_translation = mat4.create();
			m_translation = mat4.fromTranslation(m_translation, position);
		
			var transform = mat4.create();
			mat4.multiply(transform, transform, m_translation);
			mat4.multiply(transform, transform, m_rotation);
			mat4.multiply(transform, transform, m_scale);
		
			return transform;
		};
	
		this.render = function(shader) {		
			model.render(shader);
		};
		
		this.getModel = function() {
			return model;
		};
		
		this.setModel = function(m) {
			model = m;
		};
		
		this.getMaterial = function() {
			return material;
		};
		
		this.setMaterial = function(m) {
			material = m;
		};
		
		this.getScale = function() {
			return scale;
		};
		
		this.setScale = function(s) {
			scale = s;
		};
		
		this.getRotation = function() {
			return rotation;
		};
		
		this.setRotation = function(r) {
			rotation = r;
		};
		
		this.getPosition = function() {
			return position;
		};
		
		this.setPosition = function(p) {
			position = p;
		};
	}
	
	function PointLight() {
		var position;
		var ambient;
		var diffuse;
		var specular;
		var constant;
		var linear;
		var quadratic;
		
		this.getPosition = function() {
			return position;
		};
		
		this.setPosition = function(p) {
			position = p;
		};
		
		this.getAmbient = function() {
			return ambient;
		};
		
		this.setAmbient = function(a) {
			ambient = a;
		};
		
		this.getDiffuse = function() {
			return diffuse;
		};
		
		this.setDiffuse = function(d) {
			diffuse = d;
		};
		
		this.getSpecular = function() {
			return specular;
		};
		
		this.setSpecular = function(s) {
			specular = s;
		};
		
		this.getConstant = function() {
			return constant;
		};
		
		this.setConstant = function(c) {
			constant = c;
		};
		
		this.getLinear = function() {
			return linear;
		};
		
		this.setLinear = function(l) {
			linear = l;
		};
		
		this.getQuadratic = function() {
			return quadratic;
		};
		
		this.setQuadratic = function(q) {
			quadratic = q;
		};
	}
	
	function Render() {
		gl.clearColor(0, 0, 0, 1);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
		this.render = function(world) {
			resize(gl.canvas);
		
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			if (world != null) {
				world.render();
			}
		};
	
		function resize(canvas) {
			var displayWidth = canvas.clientWidth;
			var displayHeight = canvas.clientHeight;
	
			if (canvas.width != displayWidth || canvas.height != displayHeight) {
				canvas.width = displayWidth;
				canvas.height = displayHeight;
			}
	
			gl.viewport(0, 0, canvas.width, canvas.height);
		}
	}
	
	function Shader() {
		var shaderProgram = gl.createProgram();
		
		var vertexShader = getShader(gl, "shader-vs");
		var fragmentShader = getShader(gl, "shader-fs");
	
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);
	
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Unable to initialize the shader program.");
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
	
		this.getShaderProgram = function() {
			return shaderProgram;
		};
	}
	
	function World() {
		var camera = new Camera(gl);
		var input = new Input(gl);
		var shader = new Shader(gl);
		var objects = [];
	
		this.update = function(deltaTime) {
			input.update(camera, deltaTime);
			camera.update();
		};
	
		this.render = function() {
			for (var i = 0; i < objects.length; i++) {
				gl.useProgram(shader.getShaderProgram());
			
				setUpShaders(objects[i]);
		
				objects[i].render(shader);
			}
		};
	
		function setUpShaders(object) {
			setUpShaderAttributes();
			setUpTransformations(object);
			setUpLighting();
			
			var viewPositionLocation = gl.getUniformLocation(shader.getShaderProgram(), "viewPosition");
			gl.uniform3f(viewPositionLocation, camera.getPosition()[0], camera.getPosition()[1], camera.getPosition()[2]);
		}
	
		function setUpShaderAttributes() {
			shader.getShaderProgram().vertexPositionAttribute = gl.getAttribLocation(shader.getShaderProgram(), "posVertex");
			gl.enableVertexAttribArray(shader.getShaderProgram().vertexPositionAttribute);
		
			shader.getShaderProgram().vertexUVAttribute = gl.getAttribLocation(shader.getShaderProgram(), "uvVertex");
			gl.enableVertexAttribArray(shader.getShaderProgram().vertexUVAttribute);
		
			shader.getShaderProgram().vertexNormalAttribute = gl.getAttribLocation(shader.getShaderProgram(), "normalVertex");
			gl.enableVertexAttribArray(shader.getShaderProgram().vertexNormalAttribute);
		}
	
		function setUpTransformations(object) {
			var mvp = mat4.create();
			mat4.multiply(mvp, mvp, camera.getProjection());
			mat4.multiply(mvp, mvp, camera.getView());
			mat4.multiply(mvp, mvp, object.getTransform());
	
			var mvpLocation = gl.getUniformLocation(shader.getShaderProgram(), "mvp");
			gl.uniformMatrix4fv(mvpLocation, false, mvp);
		
			var modelLocation = gl.getUniformLocation(shader.getShaderProgram(), "model");
			gl.uniformMatrix4fv(modelLocation, false, object.getTransform());
		
			var mv = mat4.create();
			mat4.multiply(mv, mv, camera.getView());
			mat4.multiply(mv, mv, object.getTransform());
			var normal = mat3.create();
			mat3.normalFromMat4(normal, object.getTransform());
		
			var normalLocation = gl.getUniformLocation(shader.getShaderProgram(), "normal");
			gl.uniformMatrix3fv(normalLocation, false, normal);
		
			var materialLocation = {};
			materialLocation.diffuse = gl.getUniformLocation(shader.getShaderProgram(), "material.diffuse");
			materialLocation.specular = gl.getUniformLocation(shader.getShaderProgram(), "material.specular");
			materialLocation.shininess = gl.getUniformLocation(shader.getShaderProgram(), "material.shininess");
			gl.uniform3f(materialLocation.diffuse, object.getMaterial().getDiffuse()[0], object.getMaterial().getDiffuse()[1], object.getMaterial().getDiffuse()[2]);
			gl.uniform3f(materialLocation.specular, object.getMaterial().getSpecular()[0], object.getMaterial().getSpecular()[1], object.getMaterial().getSpecular()[2]);
			gl.uniform1f(materialLocation.shininess, object.getMaterial().getShininess());
		}
	
		function setUpLighting() {
			var directionalLight = new DirectionalLight();
			if (input.getMode() == 0 || input.getMode() == 3) {
				directionalLight.setDirection(vec3.fromValues(-1, -1, -1));
			} else {
				directionalLight.setDirection(vec3.fromValues(0, 0, 0));
			}
			directionalLight.setAmbient(vec3.fromValues(0.1, 0.1, 0.1));
			directionalLight.setDiffuse(vec3.fromValues(0.8, 0.8, 0.8));
			directionalLight.setSpecular(vec3.fromValues(1, 1, 1));
		
			var directionalLightLocation = {};
			directionalLightLocation.direction = gl.getUniformLocation(shader.getShaderProgram(), "directionalLight.direction");
			directionalLightLocation.ambient = gl.getUniformLocation(shader.getShaderProgram(), "directionalLight.ambient");
			directionalLightLocation.diffuse = gl.getUniformLocation(shader.getShaderProgram(), "directionalLight.diffuse");
			directionalLightLocation.specular = gl.getUniformLocation(shader.getShaderProgram(), "directionalLight.specular");
			gl.uniform3f(directionalLightLocation.direction, directionalLight.getDirection()[0], directionalLight.getDirection()[1], directionalLight.getDirection()[2]);
			gl.uniform3f(directionalLightLocation.ambient, directionalLight.getAmbient()[0], directionalLight.getAmbient()[1], directionalLight.getAmbient()[2]);
			gl.uniform3f(directionalLightLocation.diffuse, directionalLight.getDiffuse()[0], directionalLight.getDiffuse()[1], directionalLight.getDiffuse()[2]);
			gl.uniform3f(directionalLightLocation.specular, directionalLight.getSpecular()[0], directionalLight.getSpecular()[1], directionalLight.getSpecular()[2]);
			
			var pointLight = new PointLight();
			pointLight.setPosition(vec3.fromValues(-2.0, 2.0, -2.0));
			pointLight.setAmbient(vec3.fromValues(0.1, 0.1, 0.1));
			pointLight.setDiffuse(vec3.fromValues(0.8, 0.8, 0.8));
			pointLight.setSpecular(vec3.fromValues(1, 1, 1));
			if (input.getMode() == 1 || input.getMode() == 3) {
				pointLight.setConstant(1.0);
			} else {
				pointLight.setConstant(1000.0);
			}
			pointLight.setLinear(0.09);
			pointLight.setQuadratic(0.032);

			var pointLightLocation = {};
			pointLightLocation.position = gl.getUniformLocation(shader.getShaderProgram(), "pointLight.position");
			pointLightLocation.ambient = gl.getUniformLocation(shader.getShaderProgram(), "pointLight.ambient");
			pointLightLocation.diffuse = gl.getUniformLocation(shader.getShaderProgram(), "pointLight.diffuse");
			pointLightLocation.specular = gl.getUniformLocation(shader.getShaderProgram(), "pointLight.specular");
			pointLightLocation.constant = gl.getUniformLocation(shader.getShaderProgram(), "pointLight.constant");
			pointLightLocation.linear = gl.getUniformLocation(shader.getShaderProgram(), "pointLight.linear");
			pointLightLocation.quadratic = gl.getUniformLocation(shader.getShaderProgram(), "pointLight.quadratic");
			gl.uniform3f(pointLightLocation.position, pointLight.getPosition()[0], pointLight.getPosition()[1], pointLight.getPosition()[2]);
			gl.uniform3f(pointLightLocation.ambient, pointLight.getAmbient()[0], pointLight.getAmbient()[1], pointLight.getAmbient()[2]);
			gl.uniform3f(pointLightLocation.diffuse, pointLight.getDiffuse()[0], pointLight.getDiffuse()[1], pointLight.getDiffuse()[2]);
			gl.uniform3f(pointLightLocation.specular, pointLight.getSpecular()[0], pointLight.getSpecular()[1], pointLight.getSpecular()[2]);
			gl.uniform1f(pointLightLocation.constant, pointLight.getConstant());
			gl.uniform1f(pointLightLocation.linear, pointLight.getLinear());
			gl.uniform1f(pointLightLocation.quadratic, pointLight.getQuadratic());
		
			var spotLight = new SpotLight();
			spotLight.setPosition(camera.getPosition());
			spotLight.setDirection(camera.getDirection());
			spotLight.setAmbient(vec3.fromValues(0.1, 0.1, 0.1));
			spotLight.setDiffuse(vec3.fromValues(1, 1, 1));
			spotLight.setSpecular(vec3.fromValues(1, 1, 1));
			if (input.getMode() == 2 || input.getMode() == 3) {
				spotLight.setConstant(1.0);
			} else {
				spotLight.setConstant(1000.0);
			}
			spotLight.setLinear(0.09);
			spotLight.setQuadratic(0.032);
			spotLight.setCutOff(17.5);
			spotLight.setOuterCutOff(20.0);
		
			var spotLightLocation = {};
			spotLightLocation.position = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.position");
			spotLightLocation.direction = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.direction");
			spotLightLocation.ambient = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.ambient");
			spotLightLocation.diffuse = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.diffuse");
			spotLightLocation.specular = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.specular");
			spotLightLocation.constant = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.constant");
			spotLightLocation.linear = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.linear");
			spotLightLocation.quadratic = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.quadratic");
			spotLightLocation.cutOff = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.cutOff");
			spotLightLocation.outerCutOff = gl.getUniformLocation(shader.getShaderProgram(), "spotLight.outerCutOff");
			gl.uniform3f(spotLightLocation.position, spotLight.getPosition()[0], spotLight.getPosition()[1], spotLight.getPosition()[2]);
			gl.uniform3f(spotLightLocation.direction, spotLight.getDirection()[0], spotLight.getDirection()[1], spotLight.getDirection()[2]);
			gl.uniform3f(spotLightLocation.ambient, spotLight.getAmbient()[0], spotLight.getAmbient()[1], spotLight.getAmbient()[2]);
			gl.uniform3f(spotLightLocation.diffuse, spotLight.getDiffuse()[0], spotLight.getDiffuse()[1], spotLight.getDiffuse()[2]);
			gl.uniform3f(spotLightLocation.specular, spotLight.getSpecular()[0], spotLight.getSpecular()[1], spotLight.getSpecular()[2]);
			gl.uniform1f(spotLightLocation.constant, spotLight.getConstant());
			gl.uniform1f(spotLightLocation.linear, spotLight.getLinear());
			gl.uniform1f(spotLightLocation.quadratic, spotLight.getQuadratic());
			gl.uniform1f(spotLightLocation.cutOff, Math.cos(glMatrix.toRadian(spotLight.getCutOff())));
			gl.uniform1f(spotLightLocation.outerCutOff, Math.cos(glMatrix.toRadian(spotLight.getOuterCutOff())));
		}
	
		this.spawn = function(object) {
			objects.push(object);
		};
		
		this.getCamera = function() {
			return camera;
		};
		
		this.setCamera = function() {
			camera = c;
		};
	
		this.getInput = function() {
			return input;
		};
		
		this.setInput = function(i) {
			input = i;
		};
		
		this.getShader = function() {
			return shader;
		};
		
		this.setShader = function(s) {
			shader = s;
		};
	}
	
	function SpotLight() {
		var position;
		var direction;
		var ambient;
		var diffuse;
		var specular;
		var constant;
		var linear;
		var quadratic;
		var cutOff;
		var outerCutOff;
		
		this.getPosition = function() {
			return position;
		};
		
		this.setPosition = function(p) {
			position = p;
		};
		
		this.getDirection = function() {
			return direction;
		};
		
		this.setDirection = function(d) {
			direction = d;
		};
		
		this.getAmbient = function() {
			return ambient;
		};
		
		this.setAmbient = function(a) {
			ambient = a;
		};
		
		this.getDiffuse = function() {
			return diffuse;
		};
		
		this.setDiffuse = function(d) {
			diffuse = d;
		};
		
		this.getSpecular = function() {
			return specular;
		};
		
		this.setSpecular = function(s) {
			specular = s;
		};
		
		this.getConstant = function() {
			return constant;
		};
		
		this.setConstant = function(c) {
			constant = c;
		};
		
		this.getLinear = function() {
			return linear;
		};
		
		this.setLinear = function(l) {
			linear = l;
		};
		
		this.getQuadratic = function() {
			return quadratic;
		};
		
		this.setQuadratic = function(q) {
			quadratic = q;
		};
		
		this.getCutOff = function() {
			return cutOff;
		};
		
		this.setCutOff = function(c) {
			cutOff = c;
		};
		
		this.getOuterCutOff = function() {
			return outerCutOff;
		};
		
		this.setOuterCutOff = function(o) {
			outerCutOff = o;
		};
	}
}