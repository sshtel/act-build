'use strict';

module.exports = function (options) {
  const gulp = options.gulp;
  const g_jasmine = require('./jasmine')(options);
  const istanbul = require('gulp-istanbul');

  function preIstanbulTask() {
    return gulp.src(['dist/**/*.js', '!dist/spec/**/*.js'])
      .pipe(istanbul({
        includeUntested: true
      }))
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
    const remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');
    return gulp.src('coverage/coverage-final.json')
      .pipe(remapIstanbul({
        reports: {
          html: 'coverage/remap-report',
          lcovonly: 'coverage/lcov-remap.info'
        }
      }));
  }

  function replacePath() {
    const replace = require('gulp-replace');
    return gulp.src(['coverage/lcov-remap.info'])
      .pipe(replace('/dist/', '/src/'))
      .pipe(gulp.dest('coverage/'));
  }

  function curlToKibana(done) {
    const packageJson = require(`${process.cwd()}/package.json`);
    const fs = require('fs');
    const contents = fs.readFileSync('coverage/remap-report/index.html', 'utf8');
    const linecoverageMatched = contents.match(/([0-9\/\.]{2,5}).*[\n]+.*Lines.*[\n]+.*([0-9]{1,3}\/[0-9]{1,3})/);

    if (!linecoverageMatched) return done();

    const linecoverage = linecoverageMatched[2] === '0/0' ? '0' : linecoverageMatched[1];

    const util = require('util');
    const exec = require('child_process').execSync;

    const command = `curl -H 'Content-type: application/json' -XPOST -d '{"indexname": "island-coverage",
    "islandname": "${packageJson.name}", "line": ${linecoverage}}' 10.88.16.30:5301`;

    exec(command);

    return done();
  }

  gulp.task('coverage-only', gulp.series(preIstanbulTask, istanbulTask, remapIstanbulTask, replacePath));
  gulp.task('coverage', gulp.series('build', 'coverage-only'));
  gulp.task('coverage-logstash', gulp.series('build', 'doc', 'coverage-only', curlToKibana));

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
