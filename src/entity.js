/* jshint strict: false */
/* exported Entity */

function Entity(vertices, indices, model, hit) {
	this.vertices = vertices;
	this.indices = indices;
	this.model = model;

	this.inverse_model = mat4.create();
	mat4.invert(this.inverse_model, this.model);

	this.inverse_transpose_model = mat4.create();
	mat4.transpose(this.inverse_transpose_model, this.inverse_model);

	this.hit = hit;
}