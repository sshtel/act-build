'use strict';

module.exports = function (options) {
  require('./build')(options);
  const gulp = options.gulp;

  function clean(done) {
    const del = require('del');
    return del(['./dist', './node_modules', './coverage'], done);
  }

  function test(fileName = '*[Ss]pec', specPath = './dist/spec/') {
    return function testJasmine() {
      const jasmine = require('gulp-jasmine');
      const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
      const glob = require('glob');

      for (const key in options.envContents) {
        if (process.env[key] !== undefined) continue;
        const value = options.envContents[key];
        process.env[key] = value;
      }

      const pattern = `${specPath}${fileName}.js`;
      const files = glob.sync(pattern);
      if (files.length === 0) {
        console.warn(`There is no .spec files.\nTest step ignored.\nPattern: ${pattern}`);
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
    const specPath = './dist/spec/';
    const glob = require('glob');
    const files = glob.sync(`${specPath}*.js`);
    files.forEach(function (name) {
      // ./dist/spec/abc.spec.js => abc.spec
      const taskName = name.match(/^.*\/(.*)\.js$/)[1];
      gulp.task(taskName, function watchTypescriptsforSpec(done) {
        gulp.watch(options.sources, { ignoreInitial: false }, gulp.series('compile', test(taskName)));
      });
    });
  }

  gulp.task('clean', clean);

  gulp.task('integration', gulp.series('build', test('*[Ss]pec', './dist/integration/')));
  gulp.task('integration-test', gulp.series('integration'));

  gulp.task('test-only', gulp.series(test()));
  gulp.task('test', gulp.series('build', test()));
  gulp.task('unit-test', gulp.series('test'));
  gulp.task('default', gulp.series('test'));

  registerJasmineTasks();

  return {
    funcs: {
      test,
      clean
    },
    tasks: [
      'clean',
      'integration',
      'test',
      'default'
    ]
  };
}
