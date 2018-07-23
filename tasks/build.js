'use strict';

module.exports = (options) => {
  const gulp = options.gulp;

  function showIslandVersions(done) {
    try {
      const spawnSync = require('child_process').spawnSync;
      const npmlist = JSON.parse(spawnSync('npm', ['list', '--depth=0', '--json']).stdout.toString());

      console.log('============= Compile Versions of Island Packs ===========');
      console.log(`island: ${npmlist.dependencies.island.version}`);
      console.log(`island-base: ${npmlist.dependencies['island-base'].version}`);
      console.log(`island-keeper: ${npmlist.dependencies['island-keeper'].version}`);
      console.log(`distlock: ${npmlist.dependencies.distlock.version}`);
    } catch (e) {

    }

    done();
  }

  // for incremental build test
  function compileWithGulpTypescript() {
    const sourcemaps = require('gulp-sourcemaps');
    const ts = require('gulp-typescript');
    const tsProject = ts ? ts.createProject('tsconfig.json') : undefined;

    // if DEBUG=*, gulp-sourcemap generates many annoying logs;
    return gulp.src(options.sources, { since: gulp.lastRun('compile') })
      // .pipe(options.errorHandler)
      .pipe(sourcemaps.init())
      .pipe(tsProject())
      .on('error', function (err) {
        console.log(err.message);
        if (options.command.match(/(spec|watch)/)) {
          console.error(`[WARNING] gulp compile typescript failed, but ignored for continue test`);
          this.emit('end');
        } else {
          process.exit(1);
        }
      })
      .pipe(sourcemaps.mapSources((sourcePath, file) => {
        const length = sourcePath.split('/').length;
        sourcePath = 'src/' + sourcePath;
        for (var i = 0; i < length; ++i) {
          sourcePath = '../' + sourcePath;
        }
        return sourcePath;
      }))
      // .pipe(sourcemaps.write('', {
      //   //destPath: 'dist',
      //   includeContent: false,
      //   sourceRoot: function (file) {
      //     return 0;
      //   },
      //   sourceMappingURL: function (file) {
      //     return `${file.relative.split('/').pop()}.map`;
      //   }
      // }))
      .pipe(sourcemaps.write({
      }))
      .pipe(gulp.dest('dist'));
  }

  function doLint() {
    const tslint = require('gulp-tslint');

    if (process.env.npm_lifecycle_event && process.env.npm_lifecycle_event !== 'build') {
      console.warn(`LINT step ignored. 'npm run build' will run LINT`);
      return gulp.src('empty', { allowEmpty: true });
    }
    return gulp.src(options.sources)
      .pipe(tslint({
        fix: true,
        formatter: 'stylish'
      }))
      .on('error', function (err) {
        console.log(err.message);
        process.exit(1);
      })
      .pipe(tslint.report({
        summarizeFailureOutput: true
      }));
  }

  function staticdata() {
    return gulp.src(['./src/staticdata/*'])
      .pipe(gulp.dest('./dist/staticdata/', { mode: '0644' }));
  }

  function executeIslandDocGen(options) {
    const islandDoc = require('island-doc').default;

    if (process.env.npm_lifecycle_event && process.env.npm_lifecycle_event !== 'build') {
      return function ignore_env_doc(done) {
        console.warn(`ENV_DOCUMENTATION step ignored. 'npm run build' will run this`);
        return done();
      };
    }

    options = options || {};
    return function env_doc(done) {
      islandDoc.run(done);
    };
  }

  gulp.task('islandversion', showIslandVersions);
  gulp.task('compile', compileWithGulpTypescript);
  gulp.task('build', gulp.series(gulp.parallel(staticdata, doLint, executeIslandDocGen()), 'compile'));

  return {
    funcs: {
      showIslandVersions,
      compileWithGulpTypescript,
      doLint,
      staticdata,
      executeIslandDocGen
    },
    tasks: [
      'islandversion',
      'compile',
      'build'
    ]
  };
}
