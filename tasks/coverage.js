'use strict';

module.exports = function (options) {
  const gulp = options.gulp;
  const g_jasmine = require('./jasmine')(options);
  const istanbul = require('gulp-istanbul');
  const remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');
  const replace = require('gulp-replace');

  function preIstanbulTask() {
    return gulp.src(['dist/**/*.js', '!dist/spec/**/*.js'])
      .pipe(istanbul())
      .pipe(istanbul.hookRequire());
  }

  function istanbulTask() {
    const stream = g_jasmine.funcs.test()();
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
          lcovonly: 'coverage/lcov-remap.info'
        }
      }));
  }

  function replacePath() {
    return gulp.src(['coverage/lcov-remap.info'])
      .pipe(replace('/dist/', '/src/'))
      .pipe(gulp.dest('coverage/'));
  }

  function curlToKibana(done) {
    const packageJson = require(`${process.cwd()}/package.json`);
    const fs = require('fs');
    const contents = fs.readFileSync('coverage/remap-report/index.html', 'utf8');
    const linecoverage = contents.match(/([0-9\/\.]{2,5}).*[\n]+.*Lines/);

    if (!linecoverage) return done();

    const util = require('util');
    const exec = require('child_process').execSync;

    const command = `curl -H 'Content-type: application/json' -XPOST -d '{"indexname": "island-coverage",
    "islandname": "${packageJson.name}", "line": ${linecoverage[1]}}' 10.88.16.30:5301`;

    exec(command);

    return done();
  }

  gulp.task('coverage', gulp.series('build', preIstanbulTask, istanbulTask, remapIstanbulTask, replacePath));
  gulp.task('coverage-logstash', gulp.series('coverage', curlToKibana));

  return {
    funcs: {
      preIstanbulTask,
      istanbulTask,
      remapIstanbulTask,
      replacePath,
      curlToKibana
    },
    tasks: [
      'coverage',
      'coverage-logstash'
    ]
  };
}
