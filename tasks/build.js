'use strict';

module.exports = function (gulp) {
  const tslint = require('gulp-tslint');
  const islandDoc = require('island-doc').default;
  const ts = require('gulp-typescript');
  const sourcemaps = require('gulp-sourcemaps');

  const tsProject = ts ? ts.createProject('tsconfig.json') : undefined;
  const sources = ['./src/**/*.ts'];

  // for incremental build test
  function compileWithGulpTypescript() {
    // if DEBUG=*, gulp-sourcemap generates many annoying logs;
    return gulp.src(sources, { since: gulp.lastRun('compile') })
      .pipe(sourcemaps.init())
      .pipe(tsProject())
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
    if (process.env.npm_lifecycle_event && process.env.npm_lifecycle_event !== 'build') {
      console.warn(`LINT step ignored. 'npm run build' will run LINT`);
      return gulp.src('empty', { allowEmpty: true });
    }
    return gulp.src(sources)
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
      .pipe(gulp.dest('./dist/staticdata/', { mode: '0644' }))
  }

  function executeIslandDocGen(options) {
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

  gulp.task('compile', compileWithGulpTypescript);
  gulp.task('build', gulp.series(gulp.parallel(staticdata, doLint, executeIslandDocGen()), 'compile'));
}