var gulp = require('gulp');
var watch = require('gulp-watch');
const sass = require('gulp-sass')(require('sass'));
const foundryPath = require("./foundry-path.js")

gulp.task('sass', function(){
  return gulp.src('src/styles/pillars.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest(foundryPath.systemPath))
});

gulp.task('system', function(){
  return gulp.src(["./system.json", "./template.json"])
    .pipe(gulp.dest(foundryPath.systemPath))
});

gulp.task('watch', function () {
  gulp.watch('./src/styles/*', gulp.series('sass'));
  //gulp.watch('./stat', gulp.series('sass'));
});