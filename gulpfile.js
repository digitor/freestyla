var gulp = require('gulp')
  , autoprefixer = require('gulp-autoprefixer')
  , gutil = require('gulp-util')
  , jshint = require('gulp-jshint')
  , stylish = require('jshint-stylish')
  , jasmine = require('gulp-jasmine')
  , reporters = require('jasmine-reporters')
  , webserver = require('gulp-webserver')
  , Server = require('karma').Server
  , runSequence = require('run-sequence')
  , os = require("os")
  , uglify = require('gulp-uglify')
  , rename = require('gulp-rename')

var webserverStream
  , forceKill = false

gulp.task('minjs', function() {
  return gulp.src('src/nimblecss.js')
    .pipe(uglify({
    	mangle: false
    }))
    .pipe(rename('nimblecss.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('lint', function () {
  return gulp.src(['**/*.js', '!node_modules{,/**}']).pipe(jshint()).pipe(jshint.reporter(stylish))
})

gulp.task('webserver-for-dev', function() {
  webserverStream = gulp.src('./')
    .pipe(webserver({
      port: 8080,
      directoryListing: true,
      livereload: true,
      open: true
    }));
    return webserverStream;
});


gulp.task('webserver-for-test', function() {
  webserverStream = gulp.src('./')
    .pipe(webserver({
      port: 8081
    }));
    return webserverStream;
});


gulp.task('unit-tests', function() {
	return gulp.src('spec/unit.js')
		.pipe(jasmine({
			reporter: new reporters.JUnitXmlReporter()
			
		}))
})


gulp.task("test", function(done) {
	runSequence(['webserver-for-test', 'unit-tests', 'lint'], 'e2e-tests', done);
});



gulp.task('e2e-tests', function (done) {

	gutil.log(gutil.colors.magenta('WARNING: you must have `gulp webserver` going before running this task, plus an active internet connection (for karma proxies).'));

	new Server({
		configFile: __dirname + '/karma.conf.js',
		proxies: {
		  '/demos/img/': 'http://localhost:8081/demos/img/'
		},
		 singleRun: true
	}, function() {
		if(forceKill && webserverStream) webserverStream.emit("kill");
		
		done();

		if(forceKill) process.exit(1);
	}).start();
});


gulp.task('default', function(done) {
	runSequence('minjs', 'test', done)
})
