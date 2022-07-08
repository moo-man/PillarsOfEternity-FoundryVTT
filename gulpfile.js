var gulp = require('gulp');
const gulpEsbuild = require('gulp-esbuild')
const sass = require('gulp-sass')(require('sass'));
const esCopy = require("esbuild-plugin-copy")
const foundryPath = require("./foundry-path.js")
const esBuildConfig = require("./esbuild.config");
let buildPath = foundryPath.systemPath

gulp.task('sass', function () {
  return gulp.src('src/styles/pillars.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest(foundryPath.systemPath))
});

gulp.task('watch', function () {
  gulp.watch('./src/styles/*', gulp.series('sass'));
  gulp.watch('./static/**/*', gulp.series('src'));
  gulp.watch('./src/**/*', gulp.series('src'));
  gulp.watch('./template.json', gulp.series('src'));
  gulp.watch('./system.json', gulp.series('src'));
});

gulp.task("build", function()
{
  gulp.series("src", "sass", "watch")();
})

gulp.task("src", function (resolve) {
  gulp.src("src/pillars.ts").pipe(gulpEsbuild(esBuildConfig)).pipe(gulp.dest(buildPath))
  resolve();
})

