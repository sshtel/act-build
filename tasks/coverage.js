'use strict';

module.exports = function (gulp) {
  require('./build')(gulp);
  const jasmine = require('gulp-jasmine');
  const istanbul = require('gulp-istanbul');
  const remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

  function preIstanbulTask() {
    return gulp.src(['dist/**/*.js', '!dist/spec/**/*.js'])
      .pipe(istanbul())
      .pipe(istanbul.hookRequire());
  }

  function istanbulTask() {
    const stream = gulp.src(['dist/spec/*.js']).pipe(jasmine({
      includeStackTrace: true,
      helpers: [
        "helpers/**/*.js"
      ],
      config: {
        random: false
      }
    }));
    // https://github.com/gulpjs/gulp/issues/358 or gulp-plumber
    stream.on('error', (e) => {
      console.error('error on running coverage: ', e);
      process.exit(1);
    });
    return stream.pipe(istanbul.writeReports());
  }

  function remapIstanbulTask() {
    return gulp.src('coverage/coverage-final.json')
      .pipe(remapIstanbul({
        reports: {
          html: 'coverage/remap-report',
          'lcovonly': 'coverage/lcov-remap.info'
        }
      }));
  }

  gulp.task('coverage', gulp.series('build', preIstanbulTask, istanbulTask, remapIstanbulTask));
}