var gulp = require('gulp');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var connect = require('gulp-connect');
// var uglify = require('gulp-uglify');
var prettyHrtime = require('pretty-hrtime');
var livereload = require('gulp-livereload');
var gulpif = require('gulp-if');

var sourceFile = './src/js/main.js';
var destinationFolder = './js';
var destinationFile = 'bundle.js'

gulp.task('build', function() {
	browserifyShare(false);
});

gulp.task('watch', function() {
	browserifyShare(true);
});

function browserifyShare(watchMode) {
	var bundler = browserify({
		cache: {},
		packageCache: {},
		fullPaths: true,
		debug: true
	});

	if (watchMode) {
		bundler = watchify(bundler);
		bundler.on('update', function(filePath) {
			gutil.log('File changed:', gutil.colors.green(filePath));
			var startTime = process.hrtime();
			newBundle(bundler, watchMode);
			var taskTime = process.hrtime(startTime);
			var prettyTime = prettyHrtime(taskTime);
			gutil.log('Bundled', gutil.colors
				.green(filePath), 'in', gutil.colors.magenta(
					prettyTime));
		});
	}

	bundler.add(sourceFile);

	newBundle(bundler, watchMode);
}

function newBundle(bundler, watchMode) {
	bundler.transform(babelify)
		.bundle()
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source(destinationFile))
		.pipe(buffer())
		// .pipe(sourcemaps.init({
		//   loadMaps: true
		// }))
		// .pipe(uglify({ mangle: false }))
		// .pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(destinationFolder));
	// .pipe(gulpif(watchMode, livereload({
	//   start: true
	// })));
}

gulp.task('server', function() {
	connect.server({
		port: 8082
	});
});


gulp.task('default', ['build']);
