'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

function assertFileEquality(test, pathToActual, pathToExpected, message) {
  var actual = grunt.file.read(pathToActual);
  var expected = grunt.file.read(pathToExpected);
  test.equal(expected, actual, message);
}

exports.builder = {
  patch: function(test) {
    test.expect(4);

    assertFileEquality(test, 'tmp/patch/VERSION', 'test/expected/patch/VERSION', 'patch the VERSION FILE');
    assertFileEquality(test, 'tmp/patch/package.json', 'test/expected/patch/package.json', 'patch the package.json FILE');
    assertFileEquality(test, 'tmp/patch/bower.json', 'test/expected/patch/bower.json', 'patch the bower.json FILE');
    assertFileEquality(test, 'tmp/patch/README.md', 'test/expected/patch/README.md', 'patch the README.md FILE');

    test.done();
  }
};
