#! /usr/bin/env node

var fs        = require('fs')
var access    = promisify(fs.access);
var chmod     = promisify(fs.chmod);
var unlink    = promisify(fs.unlink);
var writeFile = promisify(fs.writeFile);
var exec      = promisify(require('shelljs').exec);

var file = combineStrings(__dirname, '__script__.sh', { splitChar: '/' });
var template = '#! /usr/bin/env node';

/**
 * TODO: drop in custom logger (?)
 */ 
var logger = {
  info: console.log,
  error: console.error
};

function waterfall(asyncFuncs) {
  asyncFuncs = Array.isArray(asyncFuncs) ? asyncFuncs : [];
  return asyncFuncs.reduce(function(chain, func) {
    return chain.then(func);
  }, Promise.resolve());
}

function promisify(func) {
  var that = this;
  if (typeof func !== 'function') {
    throw new TypeError('Expected an argument of type "function", but got ' + typeof func);
  }
  return function(/* ...args */) {
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve, reject) {
      func.apply(that, args.concat(function(err, result) {
        if (err) reject(err);
        resolve(result);
      }));
    });
  }
}

function combineStrings(/* ...args, opts */) {
  const args = Array.prototype.slice.call(arguments);
  var opts = { splitChar: '' };
  if (typeof args[args.length - 1] === 'object') {
    opts = Object.assign(opts, args.pop());
  }
  return args
    .reduce(function(cumm, curr) {
      return cumm + opts.splitChar + (curr || '');
    });
}

function run() {
  return exec(file, { silent: false });
}

function done(/* ...args */) {
  var result = arguments[0];
  /**
   * TODO: some additional logic here (?)
   */
  return Promise.resolve(result);
}

function handleError(err) {
  if (err && typeof err !== 'number') {
    logger.error(err);
    process.exit(-1);
  }
}

function deleteFile(err) {
  return access(file)
    .catch(function(err) {
      console.log(err);
      // File does not exist, just continue without unlinking
      return Promise.resolve();
    })
    .then(function() {
      return unlink(file);
    })
    .then(function(err) { // handle error if we received one as param
      handleError(err)
    })
    .catch(handleError); // handle error if unlink threw
}

function main() {
  if (Array.isArray(process.argv) && process.argv.length > 2) {
    var args = process.argv.slice(2);
    return waterfall(
      args.map(function(arg) {
        return function(content) {
          return writeFile(file, combineStrings(content || template, arg, { splitChar: '\n' }));
        }
      })
      .concat(function() {
        return chmod(file, 0o777);
      })
    )
    .then(run)
    .then(done)
    .catch(handleError)
    .then(deleteFile);
  }
  throw new TypeError('No code provided');
}

main();
