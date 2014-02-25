'use strict';

var grunt = require('grunt');

function assertFileEquality(test, pathToActual, pathToExpected, message) {
  var actual = grunt.file.read(pathToActual);
  var expected = grunt.file.read(pathToExpected);
  test.equal(expected, actual, message);
}

exports.versioner = {
  default_build: {
    default: function(test) {
      test.expect(5);

      assertFileEquality(test, 'tmp/default/VERSION', 'test/expected/default/VERSION', 'default update to the VERSION file');
      assertFileEquality(test, 'tmp/default/package.json', 'test/expected/default/package.json', 'default update to the package.json file');
      assertFileEquality(test, 'tmp/default/bower.json', 'test/expected/default/bower.json', 'default update to the bower.json file');
      assertFileEquality(test, 'tmp/default/README.md', 'test/expected/default/README.md', 'default update to the README.md file');
      assertFileEquality(test, 'tmp/default/src_file.js', 'test/expected/default/src_file.js', 'default update to the src_file file');

      test.done();
    },
    patch: function(test) {
      test.expect(5);

      assertFileEquality(test, 'tmp/patch/VERSION', 'test/expected/patch/VERSION', 'patch update to the VERSION file');
      assertFileEquality(test, 'tmp/patch/package.json', 'test/expected/patch/package.json', 'patch update to the package.json file');
      assertFileEquality(test, 'tmp/patch/bower.json', 'test/expected/patch/bower.json', 'patch update to the bower.json file');
      assertFileEquality(test, 'tmp/patch/README.md', 'test/expected/patch/README.md', 'patch update to the README.md file');
      assertFileEquality(test, 'tmp/patch/src_file.js', 'test/expected/patch/src_file.js', 'patch update to the src_file file');

      test.done();
    },
    minor: function(test) {
      test.expect(5);

      assertFileEquality(test, 'tmp/minor/VERSION', 'test/expected/minor/VERSION', 'minor update to the VERSION file');
      assertFileEquality(test, 'tmp/minor/package.json', 'test/expected/minor/package.json', 'minor update to the package.json file');
      assertFileEquality(test, 'tmp/minor/bower.json', 'test/expected/minor/bower.json', 'minor update to the bower.json file');
      assertFileEquality(test, 'tmp/minor/README.md', 'test/expected/minor/README.md', 'minor update to the README.md file');
      assertFileEquality(test, 'tmp/minor/src_file.js', 'test/expected/minor/src_file.js', 'minor update to the src_file file');

      test.done();
    },
    major: function(test) {
      test.expect(5);

      assertFileEquality(test, 'tmp/major/VERSION', 'test/expected/major/VERSION', 'major update to the VERSION file');
      assertFileEquality(test, 'tmp/major/package.json', 'test/expected/major/package.json', 'major update to the package.json file');
      assertFileEquality(test, 'tmp/major/bower.json', 'test/expected/major/bower.json', 'major update to the bower.json file');
      assertFileEquality(test, 'tmp/major/README.md', 'test/expected/major/README.md', 'major update to the README.md file');
      assertFileEquality(test, 'tmp/major/src_file.js', 'test/expected/major/src_file.js', 'major update to the src_file file');

      test.done();
    },
    git: function(test) {
      test.expect(1);

      assertFileEquality(test, 'tmp/git/VERSION', 'test/expected/git/VERSION', 'git update to the VERSION file');
      
      test.done();
    }
  },
  withOptions: {
    setVersion: function(test) {
      test.expect(5);

      assertFileEquality(test, 'tmp/set_version/VERSION', 'test/expected/set_version/VERSION', 'setVersion update to the VERSION file');
      assertFileEquality(test, 'tmp/set_version/package.json', 'test/expected/set_version/package.json', 'setVersion update to the package.json file');
      assertFileEquality(test, 'tmp/set_version/bower.json', 'test/expected/set_version/bower.json', 'setVersion update to the bower.json file');
      assertFileEquality(test, 'tmp/set_version/README.md', 'test/expected/set_version/README.md', 'setVersion update to the README.md file');
      assertFileEquality(test, 'tmp/set_version/src_file.js', 'test/expected/set_version/src_file.js', 'setVersion update to the src_file file');

      test.done();
    }
  }
};
