'use strict';

module.exports = function (gulp) {
  const commands = process.argv.filter((v) => {
    return !v.match(/\/(node|gulp)/);
  });
  
  require('./build')(gulp);
  require('./coverage')(gulp);
  require('./jasmine')(gulp);
}