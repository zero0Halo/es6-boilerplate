'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const fs = require('fs');
const gutils = require('gulp-util');
const path = require('path');
//------------------------------------------------
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
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
          gutils.log(gutils.colors.red(err));
          this.emit('end');
        }
    }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(mincss())
    .pipe(sourcemaps.write())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./build/'));
});


gulp.task('images', () => {
  return gulp.src('src/images/*.+(png|jpg|gif)')
    .pipe( changed('build/images') )
    .pipe( imagemin() )
    .pipe( gulp.dest('./build/images/') )
});


// Transpile es6 to es5 with sourcemaps and puts it in a temp directory
gulp.task('es6-commonjs', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe(plumber({
        errorHandler: function (err) {
          gutils.log(gutils.colors.red(err));
          this.emit('end');
        }
    }))
    .pipe(sourcemaps.init())
    .pipe( babel({
        presets: ['es2015']
    }) )
    .pipe(sourcemaps.write('.'))
    .pipe(plumber.stop())
    .pipe( gulp.dest('./src/temp/') );
});


// Use browserify for es6 module usage based one what's in the temp directory
gulp.task('commonjs-bundle', ['es6-commonjs'], () => {
  var appJsExists = fs.existsSync('./src/temp/app.js');

  // Need to make this check, because if es6-commonjs failed gulp.watch will die because the file isn't there
  if(appJsExists){
    return browserify('./src/temp/app.js').bundle()
      .pipe(plumber({
          errorHandler: function (err) {
            gutils.log(gutils.colors.red(err));
            this.emit('end');
          }
      }))
      .pipe(source('./src/temp/app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(rename('bundle.js'))
      .pipe(plumber.stop())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./build/'));
  }

});


// Transpiles es6 to es5, including modules, and when done destroys the temp directory
gulp.task('transcode-js', ['commonjs-bundle'], () => {
  return del(['./src/temp/*', '!./src/temp/.gitkeep']);
});


// Watches for index.html, less and js changes
gulp.task('watcher', () => {
  let handleDelete = event => {
    if(event.type === 'deleted') {
      // Simulating the {base: 'src'} used with gulp.src in the scripts task
      var filePathFromSrc = path.relative(path.resolve('src'), event.path);

      // Concatenating the 'build' absolute path used by gulp.dest in the scripts task
      var destFilePath = path.resolve('build', filePathFromSrc);

      del.sync(destFilePath);
    }
  };

  let html = gulp.watch('src/index.html', ['html']);
  let images = gulp.watch('src/images/*.+(png|jpg|gif)', ['images']);
  let js = gulp.watch('src/js/**/*.js', ['transcode-js']);
  let less = gulp.watch('src/less/**/*.less', ['less']);

  html.on('change', handleDelete);
  images.on('change', handleDelete);
  js.on('change', handleDelete);
  less.on('change', handleDelete);
});


// Default task to rule them all
gulp.task('default', ['html', 'less', 'images', 'transcode-js', 'watcher'], () => {
  gulp.src('build')
    .pipe( webserver({
      livereload: {
        enable: true,
        filter: fileName => {
          if (fileName.match(/.map$/) || fileName.match(/\/temp\//)) { // exclude all source maps from livereload
            return false;
          } else {
            return true;
          }
        }
      },
      open: true
    }));
});