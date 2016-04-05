var gulp = require('gulp')
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
  , sass = require('gulp-sass')
  , autoprefixer = require('gulp-autoprefixer')
  , flatten = require('gulp-flatten')
  , hlp = require('./src/_helpers')

var webserverStream
  , forceKill = false


var autoPrefixerBrowsers = [
    // Desktop
      'last 3 Chrome versions'
    , 'last 2 Firefox versions'
    , 'last 2 Safari versions'
    , 'last 2 Edge versions'
    , 'ie >= 9'
    // Mobile
    , 'last 3 ChromeAndroid versions'
    , 'last 3 Android versions'
    , 'last 3 FirefoxAndroid versions'
    , 'last 3 iOS versions'
    , 'last 2 ExplorerMobile versions'
    , 'last 2 OperaMobile versions'
    // Other
    , '> 2% in AU'
]

gulp.task('minjs', function() {
  return gulp.src('src/freestyler.js')
    .pipe(uglify({
    	mangle: false
    }))
    .pipe(rename('freestyler.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('styles', function() {

    return gulp.src("demos/app/*.scss")
      //.pipe(sourcemaps.init())
      .pipe(sass({ style: 'compressed' }))
        .on('error', function (err) {
            console.log('Sass error', err);
        })
        .pipe(flatten())
        .pipe(autoprefixer({browsers: autoPrefixerBrowsers}))
        //.pipe(sourcemaps.write('./maps'))
        .pipe(rename('freestyler.min.css'))
        .pipe(gulp.dest("dist/"))
})

gulp.task('lint', function () {
  return gulp.src(['**/*.js', '!**/node_modules{,/**}', "!src/lib/**/*"]).pipe(jshint()).pipe(jshint.reporter(stylish))
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
  forceKill = true;
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
