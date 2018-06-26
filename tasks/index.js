'use strict';

const cmd = process.argv.filter((v) => {
  return !v.match(/\/(node|gulp)/);
});

module.exports = function (gulp) {
  require('./build')(gulp);
  require('./coverage')(gulp);
  require('./jasmine')(gulp);

  // // for performance?
  // switch (cmd[0]) {
  //   case 'env-doc':
  //   case 'tslint':
  //   case 'build':
  //     require('./build')(gulp);
  //     break;
  //   case 'coverage':
  //     require('./coverage')(gulp);
  //     break;
  //   case 'clean':
  //   case 'start':
  //   case 'local':
  //   default:
  //     require('./build')(gulp);
  //     require('./coverage')(gulp);
  //     require('./jasmine')(gulp);
  //     break;
  // }
}