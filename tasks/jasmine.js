'use strict';

module.exports = function (gulp) {
  require('./build')(gulp);
  const jasmine = require('gulp-jasmine');
  const del = require('del');
  const glob = require('glob');

  var sources = ['./src/**/*.ts'];

  function clean(done) {
    return del(['./dist', './node_modules', './coverage'], done);
  }

  function test(fileName = '*[Ss]pec') {
    return function testJasmine() {
      return gulp.src(`./dist/spec/${fileName}.js`).pipe(jasmine({
        // verbose: true,
        includeStackTrace: true,
        config: {
          random: false
        }
      }));
    }
  }

  function registerJasmineTasks() {
    var files = glob.sync('./dist/spec/*.js');
    files.forEach(function (name) {
      // ./dist/spec/abc.spec.js => abc.spec
      var taskName = name.match(/^.*\/(.*)\.js$/)[1];
      jasmineTask(taskName);
    });
  }

  function jasmineTask(name) {
    var buildAndTest = 'run-' + name;

    gulp.task(buildAndTest, gulp.series(['build'], test(name)));
    gulp.task(name, gulp.series(build, test(name), function watchTypescriptsforSpec() {
      gulp.watch(sources, gulp.series(build, test(name)));
    }));
  }

  gulp.task('clean', clean);
  gulp.task('test', gulp.series('build', test()));

  registerJasmineTasks();
}