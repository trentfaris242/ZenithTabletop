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
		var diffuse = vec3.create();
		var specular = vec3.create();
		var shininess = 1;

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
					var objResult = parseOBJ(self, req.responseText);
					if (!objResult.success) {
						throw objResult.message;
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
			var numTotalVertices = 0;
			var numTotalUVs = 0;
			var numTotalNormals = 0;
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
						// Verify correct format
						if (!(unpackedVertices.length * 2 == unpackedUVs.length * 3 && unpackedUVs.length * 3 == unpackedNormals.length * 2)) {
							self.setMeshes([]);
							return new OBJResult(false, "OBJ file is not properly formatted.");
						}
						if (unpackedVertices.length == 0 || unpackedUVs.length == 0 || unpackedNormals.length == 0) {
							self.setMeshes([]);
							return new OBJResult(false, "OBJ file is not properly formatted.");
						}

						if (unpackedVertices.length % 3 != 0) {
							self.setMeshes([]);
							return new OBJResult(false, "Vertex does not have 3-dimensional elements.");
						}
						if (unpackedUVs.length % 2 != 0) {
							self.setMeshes([]);
							return new OBJResult(false, "Texture coordinate does not have 2-dimensional elements.");
						}
						if (unpackedNormals.length % 3 != 0) {
							self.setMeshes([]);
							return new OBJResult(false, "Normal does not have 3-dimensional elements.");
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

						// Update variables
						numTotalVertices += vertices.length / 3;
						numTotalUVs += uvs.length / 2;
						numTotalNormals += normals.length / 3;
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
						return new OBJResult(false, "Vertex does not have 3 elements.");
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
						return new OBJResult(false, "Texture coordinate does not have 2 elements.");
					}

					uvs.push(words[1]);
					uvs.push(words[2]);
				}

				// If row is a normal
				else if (words[0] == "vn") {
					// Verify correct format
					if (words.length != 4) {
						self.setMeshes([]);
						return new OBJResult(false, "Normal does not have 3 elements.");
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
						return new OBJResult(false, "Face does not have 3 elements.");
					}

					for (var j = 1; j < words.length; j++) {
						if (words[j] in hashIndices) {
							indices.push(hashIndices[words[j]]);
						} else {
							var vertex = words[j].split("/");

							// Verify correct format
							if (vertex.length != 3) {
								self.setMeshes([]);
								return new OBJResult(false, "Face does not have 3 elements.");
							}

							// Verify correct format
							if (vertex[0] > vertices.length) {
								self.setMeshes([]);
								return new OBJResult(false, "Face's vertex's vertex is out of range.");
							}
							if (vertex[1] > uvs.length) {
								self.setMeshes([]);
								return new OBJResult(false, "Face's vertex's texture coordinate is out of range.");
							}
							if (vertex[2] > normals.length) {
								self.setMeshes([]);
								return new OBJResult(false, "Face's vertex's normal is out of range.");
							}

							unpackedVertices.push(vertices[(vertex[0] - 1 - numTotalVertices) * 3 + 0]);
							unpackedVertices.push(vertices[(vertex[0] - 1 - numTotalVertices) * 3 + 1]);
							unpackedVertices.push(vertices[(vertex[0] - 1 - numTotalVertices) * 3 + 2]);

							if (vertex[1] == "") {
								unpackedUVs.push(-1);
								unpackedUVs.push(-1);
							} else {
								unpackedUVs.push(uvs[(vertex[1] - 1 - numTotalUVs) * 2 + 0]);
								unpackedUVs.push(uvs[(vertex[1] - 1 - numTotalUVs) * 2 + 1]);
							}

							unpackedNormals.push(normals[(vertex[2] - 1 - numTotalNormals) * 3 + 0]);
							unpackedNormals.push(normals[(vertex[2] - 1 - numTotalNormals) * 3 + 1]);
							unpackedNormals.push(normals[(vertex[2] - 1 - numTotalNormals) * 3 + 2]);

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
					return new OBJResult(false, "Unknown attribute: " + words[0]);
				}
			}

			// After last row, store last mesh
			if (currentMesh != null) {
				// Verify correct format
				if (!(unpackedVertices.length * 2 == unpackedUVs.length * 3 && unpackedUVs.length * 3 == unpackedNormals.length * 2)) {
					self.setMeshes([]);
					return new OBJResult(false, "OBJ file is not properly formatted.");
				}
				if (unpackedVertices.length == 0 || unpackedUVs.length == 0 || unpackedNormals.length == 0) {
					self.setMeshes([]);
					return new OBJResult(false, "OBJ file is not properly formatted.");
				}

				if (unpackedVertices.length % 3 != 0) {
					self.setMeshes([]);
					return new OBJResult(false, "Vertex does not have 3-dimensional elements.");
				}
				if (unpackedUVs.length % 2 != 0) {
					self.setMeshes([]);
					return new OBJResult(false, "Texture coordinate does not have 2-dimensional elements.");
				}
				if (unpackedNormals.length % 3 != 0) {
					self.setMeshes([]);
					return new OBJResult(false, "Normal does not have 3-dimensional elements.");
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

			return new OBJResult(true, "OBJ file parsed successfully");
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
	
	function OBJResult(success, message) {
		this.success = success;
		this.message = message;
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
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.depthFunc(gl.LEQUAL);
		resize();

		this.render = function(world) {
			resize();

			if (world != null) {
				world.render();
			}
		};

		function resize() {
			var displayWidth = gl.canvas.clientWidth;
			var displayHeight = gl.canvas.clientHeight;

			if (gl.canvas.width != displayWidth || gl.canvas.height != displayHeight) {
				gl.canvas.width = displayWidth;
				gl.canvas.height = displayHeight;
			}

			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		}
	}
	
	function Shader(vertex, fragment) {
		var shaderProgram = gl.createProgram();
		
		var vertexShader = getShader(vertex, gl.VERTEX_SHADER);
		var fragmentShader = getShader(fragment, gl.FRAGMENT_SHADER);
		
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Unable to initialize the shader program.");
		}
		
		function getShader(source, type) {
			var shader;
			if (type == gl.VERTEX_SHADER) {
				shader = gl.createShader(gl.VERTEX_SHADER);
			} else if (type == gl.FRAGMENT_SHADER) {
				shader = gl.createShader(gl.FRAGMENT_SHADER);
			} else {
				return null;
			}
			
			gl.shaderSource(shader, source);
			
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
		var camera = new Camera();
		
		var input = new Input();
		
		var firstPassVertexShader = [
			"attribute highp vec3 posVertex;",
			"attribute highp vec2 uvVertex;",
			"attribute highp vec3 normalVertex;",
		
			"uniform highp mat4 mvp;",
			"uniform highp mat4 model;",
			"uniform highp mat3 normal;",
		
			"varying highp vec3 posFrag;",
			"varying highp vec2 uvFrag;",
			"varying highp vec3 normalFrag;",
			
			"void main() {",
			"	gl_Position = mvp * vec4(posVertex, 1.0);",
			"	posFrag = vec3(model * vec4(posVertex, 1.0));",
			"	uvFrag = uvVertex;",
			"	normalFrag = normal * normalVertex;",
			"}"
		].join("\n");
		var firstPassFragmentShader = [
			"struct Material {",
			"	highp vec3 diffuse;",
			"	highp vec3 specular;",
			"	highp float shininess;",
			"};",
		
			"struct DirectionalLight {",
			"	highp vec3 direction;",
			"	highp vec3 ambient;",
			"	highp vec3 diffuse;",
			"	highp vec3 specular;",
			"};",
		
			"struct PointLight {",
			"	highp vec3 position;",
			"	highp vec3 ambient;",
			"	highp vec3 diffuse;",
			"	highp vec3 specular;",
			"	highp float constant;",
			"	highp float linear;",
			"	highp float quadratic;",
			"};",
		
			"struct SpotLight {",
			"	highp vec3 position;",
			"	highp vec3 direction;",
			"	highp vec3 ambient;",
			"	highp vec3 diffuse;",
			"	highp vec3 specular;",
			"	highp float constant;",
			"	highp float linear;",
			"	highp float quadratic;",
			"	highp float cutOff;",
			"	highp float outerCutOff;",
			"};",
		
			"varying highp vec3 posFrag;",
			"varying highp vec2 uvFrag;",
			"varying highp vec3 normalFrag;",
		
			"uniform Material material;",
			"uniform DirectionalLight directionalLight;",
			"uniform PointLight pointLight;",
			"uniform SpotLight spotLight;",
			"uniform highp vec3 viewPosition;",
		
			"highp vec3 calcDirectionalLight(DirectionalLight directionalLight, highp vec3 normal, highp vec3 viewDirection) {",
			"	highp vec3 lightDirection = normalize(-directionalLight.direction);",
			"	highp vec3 halfwayDirection = normalize(lightDirection + viewDirection);",
			
			"	highp float diff = max(dot(normal, lightDirection), 0.0);",
			"	highp float spec = max(dot(normal, halfwayDirection), 0.0);",
			"	spec = pow(spec, material.shininess);",
			
			"	highp vec3 ambient = directionalLight.ambient * material.diffuse;",
			"	highp vec3 diffuse = directionalLight.diffuse * diff * material.diffuse;",
			"	highp vec3 specular = directionalLight.specular * spec * material.specular;",
			
			"	return (ambient + diffuse + specular);",
			"}",
		
			"highp vec3 calcPointLight(PointLight pointLight, highp vec3 normal, highp vec3 posFrag, highp vec3 viewDirection) {",
			"	highp vec3 lightDirection = normalize(pointLight.position - posFrag);",
			"	highp vec3 halfwayDirection = normalize(lightDirection + viewDirection);",
			
			"	highp float diff = max(dot(normal, lightDirection), 0.0);",
			"	highp float spec = max(dot(normal, halfwayDirection), 0.0);",
			"	spec = pow(spec, material.shininess);",
			
			"	highp float distance = length(pointLight.position - posFrag);",
			"	highp float attenuation = 1.0 / (pointLight.constant + pointLight.linear * distance + pointLight.quadratic * (distance * distance));",
			
			"	highp vec3 ambient = pointLight.ambient * material.diffuse;",
			"	highp vec3 diffuse = pointLight.diffuse * diff * material.diffuse;",
			"	highp vec3 specular = pointLight.specular * spec * material.specular;",
			
			"	ambient *= attenuation;",
			"	diffuse *= attenuation;",
			"	specular *= attenuation;",
			
			"	return (ambient + diffuse + specular);",
			"}",
		
			"highp vec3 calcSpotLight(SpotLight spotLight, highp vec3 normal, highp vec3 posFrag, highp vec3 viewDirection) {",
			"	highp vec3 lightDirection = normalize(spotLight.position - posFrag);",
			"	highp vec3 halfwayDirection = normalize(lightDirection + viewDirection);",
			
			"	highp float diff = max(dot(normal, lightDirection), 0.0);",
			"	highp float spec = max(dot(normal, halfwayDirection), 0.0);",
			"	spec = pow(spec, material.shininess);",
			
			"	highp float distance = length(spotLight.position - posFrag);",
			"	highp float attenuation = 1.0 / (spotLight.constant + spotLight.linear * distance + spotLight.quadratic * (distance * distance));",
			
			"	highp float theta = dot(lightDirection, normalize(-spotLight.direction));",
			"	highp float epsilon = spotLight.cutOff - spotLight.outerCutOff;",
			"	highp float intensity = clamp((theta - spotLight.outerCutOff) / epsilon, 0.0, 1.0);",
			
			"	highp vec3 ambient = pointLight.ambient * material.diffuse;",
			"	highp vec3 diffuse = pointLight.diffuse * diff * material.diffuse;",
			"	highp vec3 specular = pointLight.specular * spec * material.specular;",
			
			"	ambient *= attenuation * intensity;",
			"	diffuse *= attenuation * intensity;",
			"	specular *= attenuation * intensity;",
			
			"	return (ambient + diffuse + specular);",
			"}",
		
			"void main() {",
			"	highp vec3 normal = normalize(normalFrag);",
			"	highp vec3 viewDirection = normalize(viewPosition - posFrag);",
			"	highp vec3 result = calcDirectionalLight(directionalLight, normal, viewDirection);",
			"	result += calcPointLight(pointLight, normal, posFrag, viewDirection);",
			"	result += calcSpotLight(spotLight, normal, posFrag, viewDirection);",
			"	gl_FragColor = vec4(result, 1.0);",
			"}"
		].join("\n");
		var firstPassShader = new Shader(firstPassVertexShader, firstPassFragmentShader);
		
		var secondPassVertexShader = [
			"attribute highp vec3 posVertex;",
			"attribute highp vec2 uvVertex;",
		
			"varying highp vec2 uvFrag;",
			
			"void main() {",
			"	gl_Position = vec4(posVertex, 1);",
			"	uvFrag = uvVertex;",
			"}"
		].join("\n");
		var secondPassFragmentShader = [
			"varying highp vec2 uvFrag;",
			
			"uniform sampler2D leftTexture;",
			"uniform sampler2D rightTexture;",
			
			"void main() {",
			"	highp vec2 coord = vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));",
			"	if (mod(coord.y, 2.0) == 0.0) {",
			"		gl_FragColor = texture2D(leftTexture, uvFrag);",
			"	} else {",
			"		gl_FragColor = texture2D(rightTexture, uvFrag);",
			"	}",
			"}"
		].join("\n");
		var secondPassShader = new Shader(secondPassVertexShader, secondPassFragmentShader);
				
		var objects = [];
		
		var vertices;
		var VBO;
		var uvs;
		var TBO;
		var indices;
		var IBO;
		initQuad();
		
		var leftTexture;
		var leftFramebuffer;
		var rightTexture;
		var rightFramebuffer;
		initFramebuffers();
		
		this.update = function(deltaTime) {
			input.update(camera, deltaTime);
			camera.update();
		};

		this.render = function() {
			firstPass();
			secondPass();
		};
		
		function initQuad() {
			vertices = [
				-1, -1, 0,
				-1,  1, 0,
				 1,  1, 0,
				 1, -1, 0
			];
			VBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			VBO.itemSize = 3;
			
			uvs = [
				0, 0,
				0, 1,
				1, 1,
				1, 0
			];
			TBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, TBO);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
			TBO.itemSize = 2;
			
			indices = [1, 0, 3, 1, 3, 2];
			IBO = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
			IBO.itemSize = 1;
			IBO.numItems = indices.length / IBO.itemSize;
		}
		
		function initFramebuffers() {
			leftTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, leftTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			
			leftFramebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, leftFramebuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, leftTexture, 0);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			
			rightTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, rightTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			
			rightFramebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, rightFramebuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rightTexture, 0);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
		
		function firstPass() {
			gl.enable(gl.CULL_FACE);
			gl.enable(gl.DEPTH_TEST);
			leftFramebufferPass();
			rightFramebufferPass();
			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.CULL_FACE);
		}
		
		function leftFramebufferPass() {
			gl.bindFramebuffer(gl.FRAMEBUFFER, leftFramebuffer);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
			var oldPos = camera.getPosition();
			var newPos = oldPos;
			var forward = vec3.fromValues(camera.getDirection()[0], 0, camera.getDirection()[2]);
			vec3.normalize(forward, forward);
			var right = vec3.create();
			vec3.cross(right, forward, camera.getUp());
			vec3.scale(right, right, 0.05);
			vec3.subtract(newPos, newPos, right);
			camera.setPosition(newPos);
			camera.update();
			for (var i = 0; i < objects.length; i++) {
				gl.useProgram(firstPassShader.getShaderProgram());

				setUpShaders(objects[i]);

				objects[i].render(firstPassShader);
				
				tearDownShaders();
			}
			camera.setPosition(oldPos);
			camera.update();
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
		
		function rightFramebufferPass() {
			gl.bindFramebuffer(gl.FRAMEBUFFER, rightFramebuffer);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
			var oldPos = camera.getPosition();
			var newPos = oldPos;
			var forward = vec3.fromValues(camera.getDirection()[0], 0, camera.getDirection()[2]);
			vec3.normalize(forward, forward);
			var right = vec3.create();
			vec3.cross(right, forward, camera.getUp());
			vec3.scale(right, right, 0.05);
			vec3.add(newPos, newPos, right);
			camera.setPosition(newPos);
			camera.update();
			for (var i = 0; i < objects.length; i++) {
				gl.useProgram(firstPassShader.getShaderProgram());

				setUpShaders(objects[i]);

				objects[i].render(firstPassShader);
				
				tearDownShaders();
			}
			camera.setPosition(oldPos);
			camera.update();
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
		
		function secondPass() {
			gl.clear(gl.COLOR_BUFFER_BIT);
			
			gl.useProgram(secondPassShader.getShaderProgram());
			
			secondPassShader.getShaderProgram().vertexPositionAttribute = gl.getAttribLocation(secondPassShader.getShaderProgram(), "posVertex");
			gl.enableVertexAttribArray(secondPassShader.getShaderProgram().vertexPositionAttribute);
			
			secondPassShader.getShaderProgram().vertexUVAttribute = gl.getAttribLocation(secondPassShader.getShaderProgram(), "uvVertex");
			gl.enableVertexAttribArray(secondPassShader.getShaderProgram().vertexUVAttribute);
			
			var leftTextureLocation = gl.getUniformLocation(secondPassShader.getShaderProgram(), "leftTexture");
			var rightTextureLocation = gl.getUniformLocation(secondPassShader.getShaderProgram(), "rightTexture");
			
			gl.uniform1i(leftTextureLocation, 0);
			gl.uniform1i(rightTextureLocation, 1);
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, leftTexture);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, rightTexture);

												
			gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
			gl.vertexAttribPointer(secondPassShader.getShaderProgram().vertexPositionAttribute, VBO.itemSize, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, TBO);
			gl.vertexAttribPointer(secondPassShader.getShaderProgram().vertexUVAttribute, TBO.itemSize, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
			gl.drawElements(gl.TRIANGLES, IBO.numItems, gl.UNSIGNED_SHORT, 0);
		}
		
		function setUpShaders(object) {
			setUpShaderAttributes();
			setUpTransformations(object);
			setUpLighting();

			var viewPositionLocation = gl.getUniformLocation(firstPassShader.getShaderProgram(), "viewPosition");
			gl.uniform3f(viewPositionLocation, camera.getPosition()[0], camera.getPosition()[1], camera.getPosition()[2]);
		}

		function setUpShaderAttributes() {
			firstPassShader.getShaderProgram().vertexPositionAttribute = gl.getAttribLocation(firstPassShader.getShaderProgram(), "posVertex");
			gl.enableVertexAttribArray(firstPassShader.getShaderProgram().vertexPositionAttribute);

			firstPassShader.getShaderProgram().vertexUVAttribute = gl.getAttribLocation(firstPassShader.getShaderProgram(), "uvVertex");
			gl.enableVertexAttribArray(firstPassShader.getShaderProgram().vertexUVAttribute);

			firstPassShader.getShaderProgram().vertexNormalAttribute = gl.getAttribLocation(firstPassShader.getShaderProgram(), "normalVertex");
			gl.enableVertexAttribArray(firstPassShader.getShaderProgram().vertexNormalAttribute);
		}

		function setUpTransformations(object) {
			var mvp = mat4.create();
			mat4.multiply(mvp, mvp, camera.getProjection());
			mat4.multiply(mvp, mvp, camera.getView());
			mat4.multiply(mvp, mvp, object.getTransform());

			var mvpLocation = gl.getUniformLocation(firstPassShader.getShaderProgram(), "mvp");
			gl.uniformMatrix4fv(mvpLocation, false, mvp);

			var modelLocation = gl.getUniformLocation(firstPassShader.getShaderProgram(), "model");
			gl.uniformMatrix4fv(modelLocation, false, object.getTransform());

			var mv = mat4.create();
			mat4.multiply(mv, mv, camera.getView());
			mat4.multiply(mv, mv, object.getTransform());
			var normal = mat3.create();
			mat3.normalFromMat4(normal, object.getTransform());

			var normalLocation = gl.getUniformLocation(firstPassShader.getShaderProgram(), "normal");
			gl.uniformMatrix3fv(normalLocation, false, normal);

			var materialLocation = {};
			materialLocation.diffuse = gl.getUniformLocation(firstPassShader.getShaderProgram(), "material.diffuse");
			materialLocation.specular = gl.getUniformLocation(firstPassShader.getShaderProgram(), "material.specular");
			materialLocation.shininess = gl.getUniformLocation(firstPassShader.getShaderProgram(), "material.shininess");
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
			directionalLightLocation.direction = gl.getUniformLocation(firstPassShader.getShaderProgram(), "directionalLight.direction");
			directionalLightLocation.ambient = gl.getUniformLocation(firstPassShader.getShaderProgram(), "directionalLight.ambient");
			directionalLightLocation.diffuse = gl.getUniformLocation(firstPassShader.getShaderProgram(), "directionalLight.diffuse");
			directionalLightLocation.specular = gl.getUniformLocation(firstPassShader.getShaderProgram(), "directionalLight.specular");
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
			pointLightLocation.position = gl.getUniformLocation(firstPassShader.getShaderProgram(), "pointLight.position");
			pointLightLocation.ambient = gl.getUniformLocation(firstPassShader.getShaderProgram(), "pointLight.ambient");
			pointLightLocation.diffuse = gl.getUniformLocation(firstPassShader.getShaderProgram(), "pointLight.diffuse");
			pointLightLocation.specular = gl.getUniformLocation(firstPassShader.getShaderProgram(), "pointLight.specular");
			pointLightLocation.constant = gl.getUniformLocation(firstPassShader.getShaderProgram(), "pointLight.constant");
			pointLightLocation.linear = gl.getUniformLocation(firstPassShader.getShaderProgram(), "pointLight.linear");
			pointLightLocation.quadratic = gl.getUniformLocation(firstPassShader.getShaderProgram(), "pointLight.quadratic");
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
			spotLightLocation.position = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.position");
			spotLightLocation.direction = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.direction");
			spotLightLocation.ambient = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.ambient");
			spotLightLocation.diffuse = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.diffuse");
			spotLightLocation.specular = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.specular");
			spotLightLocation.constant = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.constant");
			spotLightLocation.linear = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.linear");
			spotLightLocation.quadratic = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.quadratic");
			spotLightLocation.cutOff = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.cutOff");
			spotLightLocation.outerCutOff = gl.getUniformLocation(firstPassShader.getShaderProgram(), "spotLight.outerCutOff");
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
		
		function tearDownShaders() {
			gl.disableVertexAttribArray(firstPassShader.getShaderProgram().vertexPositionAttribute);
			gl.disableVertexAttribArray(firstPassShader.getShaderProgram().vertexUVAttribute);
			gl.disableVertexAttribArray(firstPassShader.getShaderProgram().vertexNormalAttribute);
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