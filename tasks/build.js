'use strict';

module.exports = function (gulp) {
  const tslint = require('gulp-tslint');
  const islandDoc = require('island-doc').default;
  const ts = require('gulp-typescript');
  const sourcemaps = require('gulp-sourcemaps');
  const child_process = require('child_process');

  var tsProject = ts ? ts.createProject('tsconfig.json') : undefined;
  var sources = ['./src/**/*.ts'];
  var app;

  // for incremental build test
  function compileWithGulpTypescript() {
    var tsResult = gulp.src(sources, { since: gulp.lastRun('scripts') })
      .pipe(sourcemaps.init())
      .pipe(tsProject());

    tsResult.dts.pipe(gulp.dest('dist'));
    return tsResult.js.pipe(sourcemaps.write('.', { includeContent: false })).pipe(gulp.dest('dist'));
  }

  function executeTypescriptCompiler(options) {
    options = options || {};
    options.project = options.project || process.cwd();

    var command = makeTscCommandString(options);
    return function compileTypescript(done) {
      child_process.exec(command, function (err, stdout, stderr) {
        var outString = stdout.toString();
        if (outString) console.log('\n', outString);
        if (options.taskAlwaysSucceed) {
          return done();
        }
        done(err);
      });
    };
  }

  function makeTscCommandString(options) {
    return 'tsc ' +
      Object.keys(options)
        .filter(function (key) {
          return key !== 'taskAlwaysSucceed';
        })
        .map(function (key) {
          return '--' + key + ' ' + (options[key] || '');
        })
        .join(' ');
  }

  function doLint() {
    if (process.env.npm_lifecycle_event === 'test') {
      return gulp.src('empty', { allowEmpty: true });
    }
    return gulp.src('src/**/*.ts')
      .pipe(tslint({
        fix: true,
        formatter: 'stylish'
      }))
      .pipe(tslint.report({
        summarizeFailureOutput: true
      }));
  }

  function staticdata() {
    return gulp.src(['./src/staticdata/*'])
      .pipe(gulp.dest('dist/staticdata/', {mode: '0644'}))
  }

  function executeIslandDocGen(options) {
    if (process.env.npm_lifecycle_event === 'test') {
      return function (done) { return done(); };
    }

    options = options || {};
    return function (done) {
      islandDoc.run(done);
    };
  }

  function start() {
    return launchApp(['dist/app.js']);
  }

  function debug() {
    return launchApp(['--debug', 'dist/app.js']);
  }

  function launchApp(params, exitWithCode) {
    var spawn = child_process.spawn;
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

  function kill() {
    if (app) {
      app.kill('SIGTERM');
    }
    setTimeout(function () {
      process.exit();
    }, 500);
  }
  
  function watch() {
    gulp.watch(sources, gulp.series('scripts'));
  }

  gulp.task('staticdata', staticdata);
  gulp.task('tslint', doLint);
  gulp.task('env-doc', executeIslandDocGen());
  gulp.task('buildIgnoreError', executeTypescriptCompiler({noEmitOnError: '', taskAlwaysSucceed: true}));
  gulp.task('scripts', compileWithGulpTypescript);
  gulp.task('build', gulp.series(gulp.parallel('staticdata', 'tslint', 'env-doc'), executeTypescriptCompiler()));

  gulp.task('kill', kill);
  gulp.task('start', start);
  gulp.task('debug', debug);
  gulp.task('watch', watch);
}