'use strict';

module.exports = function (gulp) {
  require('./build')(gulp);
  const jasmine = require('gulp-jasmine');
  const del = require('del');
  const glob = require('glob');

  function clean(done) {
    return del(['./dist', './node_modules', './coverage'], done);
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
    gulp.task(buildAndTest, gulp.series(['build'], function () {
      return gulp.src('./dist/spec/' + name + '.js')
        .pipe(jasmine());
    }));

    gulp.task(name, gulp.series([buildAndTest], function () {
      gulp.watch(sources, [buildAndTest]);
    }));
  }

  gulp.task('clean', clean);

  registerJasmineTasks();
}