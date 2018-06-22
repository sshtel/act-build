'use strict';

import * as gulp from 'gulp';
import * as jasmine from 'gulp-jasmine';
import * as istanbul from 'gulp-istanbul';
import * as remapIstanbul from 'remap-istanbul/lib/gulpRemapIstanbul';
import * as del from 'del';
var tslint = require('gulp-tslint');


const sources = [__dirname + './src/**/*.ts'];

export function compileTypescript(done) {
  require('child_process').exec('tsc -p ' + process.cwd(), function (err, stdout, stderr) {
    const outString = stdout.toString();
    if (outString) console.log('\n', outString);
    done(err);
  });
}

export function watch() {
  gulp.watch([sources], {interval: 2000}, ['kill']);
}

export function clean(done) {
  
  del(['./dist', './node_modules', 'coverage'], done);
}

let app;
export function start() {
  return launchApp(['dist/app.js']);
}

export function debug() {
  return launchApp(['--debug', 'dist/app.js']);
}

export function launchApp(params, exitWithCode?) {
  const spawn = require('child_process').spawn;
  app = spawn('node', params);
  app.stdout.on('data', function (data) {
    process.stdout.write(data.toString());
  });
  app.stderr.on('data', function (data) {
    process.stderr.write(data.toString());
  });
  app.on('close', function (code) {
    console.log('child process exited with code', code);
    process.exit(exitWithCode && code || 0);
  });
}

export function kill() {
  if (app) {
    app.kill('SIGTERM');
  }
  setTimeout(function () {
    process.exit();
  }, 500);
}

export function local() {
  compileTypescript(function (err) {
    if (err) {
      console.error('\tfailed to compile. waiting for fix...');
      return;
    }
    debug();
  });
}

export function jasmineWatchTask(name) {
  const buildAndTest = 'run-' + name;
  gulp.task(name, [buildAndTest], function () {
    gulp.watch(sources, [buildAndTest]);
  });
  gulp.task(buildAndTest, ['build'], function () {
    gulp.src('./dist/spec/' + name + '.js')
      .pipe(jasmine());
  });
}

export function preIstanbulTask() {
  return gulp.src(['dist/**/*.js', '!dist/spec/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
}

export function istanbulTask() {
  const stream = gulp.src(['dist/spec/*.js']).pipe(jasmine());
  // https://github.com/gulpjs/gulp/issues/358 or gulp-plumber
  stream.on('error', (e) => {
    process.exit(1);
  });
  return stream.pipe(istanbul.writeReports());
}

export function remapIstanbulTask() {
  return gulp.src('coverage/coverage-final.json')
    .pipe(remapIstanbul({
      reports: {
        html: 'coverage/remap-report',
        'lcovonly': 'coverage/lcov-remap.info'
      }
    }));
}

export function doLint() {
    if (process.env.npm_lifecycle_event === 'test') return;
    return gulp.src('src/**/*.ts')
        .pipe(tslint({
            formatter: 'stylish'
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }));
}

export function registerJasmineTasks() {
    const files = require('glob').sync('./dist/spec/*.js');
    files.forEach(function (name) {
        // ./dist/spec/abc.spec.js => abc.spec
        const taskName = name.match(/^.*\/(.*)\.js$/)[1];
        jasmineWatchTask(taskName);
    });
}
