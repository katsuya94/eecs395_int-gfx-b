/* jshint strict: false */
/* global dat, mat4 */
/* global createProgram, resize */
/* global Buffers, Tracer, Entity, grid, init_camera */
/* exported main, canvas, gl, program */

var canvas;
var gl;

function main() {
	canvas = document.getElementById('webgl');
	gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	var program_static = createProgram(document.getElementById('static-vs').text, document.getElementById('static-fs').text);
	var program_image = createProgram(document.getElementById('image-vs').text, document.getElementById('image-fs').text);

	gl.useProgram(program_static);
	var buffers	= new Buffers(program_static);
	gl.useProgram(program_image);
	var tracer	= new Tracer(program_image);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// Set up Camera
	var camera = init_camera();

	// Geometry
	var floor = new Entity(grid(), undefined, mat4.create(), undefined);
	buffers.arrayDraw(floor, 'LINES');

	buffers.populate();

	var flag = false;

	// dat.GUI
	var panel = {
		Snap: function() {
			flag = true;
		}
	};
	var gui = new dat.GUI();
	gui.add(panel, 'Snap');

	gl.useProgram(program_static);

	var last = Date.now();

	var frame = function() {
		var now	= Date.now();
		var dt	= (now - last) / 1000.0;
		last 	= now;

		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.useProgram(program_image);

		gl.bindBuffer(gl.ARRAY_BUFFER, tracer.buffer_rectangle);
		gl.vertexAttribPointer(tracer.a_rectangle, 2, gl.FLOAT, false, 4 * ASIZE, 0 * ASIZE);
		gl.vertexAttribPointer(tracer.a_texcoord, 2, gl.FLOAT, false, 4 * ASIZE, 2 * ASIZE);

		if (flag) {
			flag = false;
			tracer.snap(camera);
		}

		gl.viewport(gl.drawingBufferWidth / 2, 0, gl.drawingBufferWidth / 2, gl.drawingBufferHeight);
		tracer.draw();

		gl.useProgram(program_static);
		gl.viewport(0, 0, gl.drawingBufferWidth/2, gl.drawingBufferHeight);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.buffer_vertex)
		gl.vertexAttribPointer(buffers.a_position, 3, gl.FLOAT, false, 6 * ASIZE, 0 * ASIZE);
		gl.vertexAttribPointer(buffers.a_color, 3, gl.FLOAT, false, 6 * ASIZE, 3 * ASIZE);

		camera.update(dt);
		buffers.draw(camera);

		window.requestAnimFrame(frame);
	};

	resize();

	gl.useProgram(program_image);
	tracer.snap(camera);

	window.requestAnimFrame(frame);
}