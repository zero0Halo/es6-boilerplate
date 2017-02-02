const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
//------------------------------------------------
const babel = require('gulp-babel');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const del = require('del');
//------------------------------------------------
const less = require('gulp-less');
const mincss = require('gulp-clean-css');
//------------------------------------------------
const webserver = require('gulp-webserver');
//------------------------------------------------


// Copies the latest html to build
gulp.task('html', () => {
  return gulp.src('./src/index.html')
    .pipe( gulp.dest('./build') )
});


// Compile less down to css and put it in the build folder
gulp.task('less', ()=> {
  return gulp.src('./src/less/index.less')
    .pipe(plumber({
        errorHandler: function (err) {
          console.log(err);
          this.emit('end');
        }
    }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(mincss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/'));
});


// Transpile es6 to es5 with sourcemaps and puts it in a temp directory
gulp.task('es6-commonjs', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe( babel({
        presets: ['es2015']
    }) )
    .pipe(sourcemaps.write('.'))
    .pipe( gulp.dest('./build/temp/') );
});


// Use browserify for es6 module usage based one what's in the temp directory
gulp.task('commonjs-bundle', () => {
  return browserify('./build/temp/app.js').bundle()
    .pipe(source('./build/temp/app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./build/'));
});


// Transpiles es6 to es5, including modules, and when done destroys the temp directory
gulp.task('transcode-js', ['es6-commonjs', 'commonjs-bundle'], () => {
  return del(['./build/temp/']);
});


// Watches for index.html, less and js changes
gulp.task('watcher', () => {
  gulp.watch('./src/index.html', ['html']);

  gulp.watch('./src/js/**/*.js', ['transcode-js']);

  gulp.watch('./src/less/**/*.less', ['less']);
});


// Starts a basic server
gulp.task('server', () =>
  gulp.src('build')
    .pipe( webserver({
      livereload: true
    }))
);


// Default task to rule them all
gulp.task('default', ['html', 'less', 'transcode-js', 'watcher', 'server'], () => {});