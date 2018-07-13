'use strict';

module.exports = function (gulp) {
  const plumber = require('gulp-plumber');
  const notify = require('gulp-notify');
  const commands = process.argv.filter((v) => {
    return !v.match(/\/(node|gulp)/);
  });

  let envContents = {};

  function _loadEnvConfig() {
    const fs = require('fs');
    let contents;
    if (fs.existsSync('./config.local') && fs.lstatSync('./config.local').isFile()) {
      contents = fs.readFileSync('./config.local').toString().split('\n');
    } else if (fs.existsSync('./config') && fs.lstatSync('./config').isFile()) {
      contents = fs.readFileSync('./config').toString().split('\n');
    }
    if (!contents) {
      return;
    }

    contents.forEach((v) => {
      const matched = v.match(/^export\s([A-z0-9_]*)\=(.*)/);
      if (!matched || matched.length !== 3) return;
      envContents[matched[1]] = matched[2];
    });
  }
  if (!commands[0] || commands[0].match(/(spec|watch|test|coverage)/)) {
    _loadEnvConfig();
  }

  const options = {
    gulp: gulp,
    sources: ['./src/**/*.ts'],
    command: commands[0],
    args: commands.slice(1),
    envContents
    // errorHandler: plumber({ errorHandler: (err) => {
    //   notify.onError({
    //     title: `Gulp error in ${err.plugin}`,
    //     message: err.toString()
    //   })(err);
    // }})
  };

  // switch (options.command) {
  //   case 'build':
  //   case 'compile':
  //   case 'coverage':
  //   case 'coverage-logstash':
  //   case 'start':
  //   case 'test':
  //     options.errorHandler = plumber({ errorHandler: () => { process.exit(1); } });
  //     break;
  // }
  switch (options.command) {
    case 'build':
    case 'compile':
    case 'islandversion':
      require('./build')(options);
      break;
    case 'coverage':
    case 'coverage-logstash':
      require('./coverage')(options);
      break;
    case 'start':
    case 'sleep':
    case 'watch':
      require('./serve')(options);
      break;
    case 'clean':
    case 'test':
    case 'default':
    case undefined:
      require('./jasmine')(options);
      break;
    default:
      require('./build')(options);
      require('./jasmine')(options);
      require('./coverage')(options);
      require('./serve')(options);
      break;
  }
}
