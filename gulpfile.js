var gulp = require('gulp');
var watch = require('gulp-watch');
const gulpEsbuild = require('gulp-esbuild')
const sass = require('gulp-sass')(require('sass'));
const foundryPath = require("./foundry-path.js")
const copyStaticFiles = require("esbuild-copy-static-files")
let buildPath = foundryPath.systemPath

gulp.task('sass', function () {
  return gulp.src('src/styles/pillars.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest(foundryPath.systemPath))
});

gulp.task('system', function () {
  return gulp.src(["./system.json", "./template.json"])
    .pipe(gulp.dest(foundryPath.systemPath))
});

gulp.task('watch', function () {
  gulp.watch('./src/styles/*', gulp.series('sass'));
  gulp.watch('./static/**/*', gulp.series('build'));
  gulp.watch('./src/**/*', gulp.series('build'));
});

gulp.task("build", function (resolve) {
  gulp.src("src/pillars.ts").pipe(gulpEsbuild({
    bundle: true,
    outfile: "pillars.js",
    plugins: [copyStaticFiles({
      src: "./static",
      dest: buildPath + "/",
      recursive: true,
    })]
  })).pipe(gulp.dest(buildPath))
  resolve();
})