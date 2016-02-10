function Render(gl) {
	var gl = gl;
	
	gl.clearColor(0.9, 0.95, 1, 1);
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