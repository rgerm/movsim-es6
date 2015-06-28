var browserify = require('broccoli-browserify');
var merge = require('broccoli-merge-trees');
var esTranspiler = require('broccoli-babel-transpiler');
var funnel = require('broccoli-funnel');

var htmlFiles = funnel('src', {
	files: ['index.html']
});

var cssFiles = funnel('src/css', {
	destDir: 'css'
});

var resFiles = funnel('src/img', {
	destDir: 'img'
});

var libsFiles = funnel('src/libs', {
	destDir: 'libs'
});

var scriptTree = esTranspiler('src', {});
var jsFile = browserify(scriptTree, {
	entries: ['./js/main.js'],
	outputFile: 'application.js'
});

module.exports = merge([htmlFiles, cssFiles, resFiles, libsFiles, jsFile]);
