'use strict';

module.exports = function (gulp) {
  const nodemon = require('gulp-nodemon');
  const sources = ['./src/**/*.ts'];

  function launchApp() {
    var script = nodemon({
      script: 'dist/app.js',
      ext: 'ts, js, json',
      watch: ['src'],
      tasks: ['test'],
      verbose: true,
      legacyWatch: true,
      ignore: ['src/**/*.spec.ts']
    }).on('start', function () {

    }).on('quit', function () {
      console.log(`App has quit`);
    }).on('restart', function (files) {
      console.log(`App restarted due to: ${files}`);
    });
    return script;
  }

  function watch() {
    gulp.watch(sources, gulp.series('build', 'start'));
  }

  async function sleep() {
    const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
    console.warn(`Sleep 10 days for keep docker alive.`);
    await timeout(86400 * 10 * 1000);
    console.warn(`Bye.`);
  }

  gulp.task('start', gulp.series('build', launchApp));
  gulp.task('watch', watch);
  gulp.task('sleep', sleep);
}