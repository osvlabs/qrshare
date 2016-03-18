var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var jade = require('gulp-jade');

gulp.task('jade', function () {
  return gulp.src('./lib/**/*.jade')
    .on('end', browserSync.reload);
});

gulp.task('default', ['jade'], function () {
  browserSync.init({
    proxy: '127.0.0.1:5000'
  });
  gulp.watch('./lib/**/*.jade', ['jade']);
});
