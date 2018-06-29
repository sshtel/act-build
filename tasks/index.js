'use strict';

module.exports = function (gulp) {
  const commands = process.argv.filter((v) => {
    return !v.match(/\/(node|gulp)/);
  });

  // only jasmine accepts args 2018-06-27
  require('./build')(gulp);
  require('./jasmine')(gulp);
  require('./coverage')(gulp);
  require('./serve')(gulp);
}