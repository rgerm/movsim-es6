var merge = require('broccoli-merge-trees');
var esTranspiler = require('broccoli-babel-transpiler');
var funnel = require('broccoli-funnel');
var fastBrowserify = require('broccoli-fast-browserify');

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
var jsFiles = fastBrowserify(scriptTree, {
  bundles: {
    'application.js': {
      entryPoints: ['./js/main.js']
    }
  }
});

module.exports = merge([htmlFiles, cssFiles, resFiles, libsFiles, jsFiles]);
