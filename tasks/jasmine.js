'use strict';

module.exports = function (options) {
  require('./build')(options);
  const gulp = options.gulp;

  function clean(done) {
    const del = require('del');
    return del(['./dist', './node_modules', './coverage'], done);
  }

  function test(fileName = '*[Ss]pec') {
    return function testJasmine() {
      const jasmine = require('gulp-jasmine');
      const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
      const glob = require('glob');

      for (const key in options.envContents) {
        if (process.env[key] !== undefined) continue;
        const value = options.envContents[key];
        process.env[key] = value;
      }

      const pattern = `./dist/spec/${fileName}.js`;
      const files = glob.sync(pattern);
      if (files.length === 0) {
        console.warn(`There is no .spec files. Test step ignored.`);
        return gulp.src('empty', { allowEmpty: true });
      }

      return gulp.src(files)
        .pipe(jasmine({
          // verbose: true,
          includeStackTrace: true,
          reporter: new SpecReporter({  // add jasmine-spec-reporter
            spec: {
              displayPending: true
            }
          }),
          config: {
            random: false
          }
        }));
    }
  }

  function registerJasmineTasks() {
    const glob = require('glob');
    const files = glob.sync('./dist/spec/*.js');
    files.forEach(function (name) {
      // ./dist/spec/abc.spec.js => abc.spec
      const taskName = name.match(/^.*\/(.*)\.js$/)[1];
      gulp.task(taskName, function watchTypescriptsforSpec(done) {
        gulp.watch(options.sources, { ignoreInitial: false }, gulp.series('compile', test(taskName)));
      });
    });
  }

  gulp.task('clean', clean);
  gulp.task('test', gulp.series('build', test()));
  registerJasmineTasks();
  gulp.task('default', gulp.series('test'));

  return {
    funcs: {
      test,
      clean
    },
    tasks: [
      'clean',
      'test',
      'default'
    ]
  };
}
