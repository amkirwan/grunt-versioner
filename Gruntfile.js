/*
 * grunt-versioner
 * https://github.com/amkirwan/grunt-versioner
 *
 * Copyright (c) 2014 Anthony Kirwan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.file.defaultEncoding = 'utf-8';
  // Project configuration.
  
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    versioner: {
      options: { 
        file: 'test/fixtures/default/package.json',
         mode: 'test' 
      },
      default: {
        files: {
          'tmp/default/VERSION': ['test/fixtures/default/VERSION'],
          'tmp/default/package.json': ['test/fixtures/default/package.json'],
          'tmp/default/bower.json': ['test/fixtures/default/bower.json'],
          'tmp/default/README.md': ['test/fixtures/default/README.md'],
          'tmp/default/src_file.js': ['test/fixtures/default/src_file.js']
        }
      },
      patch: {
        options: { 
          file: 'test/fixtures/default/package.json',
          versionType: 'patch'
        },
        files: {
          'tmp/patch/VERSION': ['test/fixtures/default/VERSION'],
          'tmp/patch/package.json': ['test/fixtures/default/package.json'],
          'tmp/patch/bower.json': ['test/fixtures/default/bower.json'],
          'tmp/patch/README.md': ['test/fixtures/default/README.md'],
          'tmp/patch/src_file.js': ['test/fixtures/default/src_file.js']
        }
      },
      minor: {
        options: {
          file: 'test/fixtures/default/VERSION',
          versionType: 'minor'
        },
        files: {
          'tmp/minor/VERSION': ['test/fixtures/default/VERSION'],
          'tmp/minor/package.json': ['test/fixtures/default/package.json'],
          'tmp/minor/bower.json': ['test/fixtures/default/bower.json'],
          'tmp/minor/README.md': ['test/fixtures/default/README.md'],
          'tmp/minor/src_file.js': ['test/fixtures/default/src_file.js']
        }
      },
      major: {
        options: {
          file: 'test/fixtures/default/VERSION',
          versionType: 'major'
        },
        files: {
          'tmp/major/VERSION': ['test/fixtures/default/VERSION'],
          'tmp/major/package.json': ['test/fixtures/default/package.json'],
          'tmp/major/bower.json': ['test/fixtures/default/bower.json'],
          'tmp/major/README.md': ['test/fixtures/default/README.md'],
          'tmp/major/src_file.js': ['test/fixtures/default/src_file.js']
        }
      },
      setVersion: {
        options: {
          setVersion: '2.0.3',
          npmTag: 'v2.0-latest',
          npm: true
        },
        files: {
          'tmp/set_version/VERSION': ['test/fixtures/default/VERSION'],
          'tmp/set_version/package.json': ['test/fixtures/default/package.json'],
          'tmp/set_version/bower.json': ['test/fixtures/default/bower.json'],
          'tmp/set_version/README.md': ['test/fixtures/default/README.md'],
          'tmp/set_version/src_file.js': ['test/fixtures/default/src_file.js']
        }
      },
      noNpmTag: {
        options: {
          setVersion: '2.0.3',
          npm: true
        },
        files: {
          'tmp/set_version/VERSION': ['test/fixtures/default/VERSION'],
          'tmp/set_version/package.json': ['test/fixtures/default/package.json'],
          'tmp/set_version/bower.json': ['test/fixtures/default/bower.json'],
          'tmp/set_version/README.md': ['test/fixtures/default/README.md'],
          'tmp/set_version/src_file.js': ['test/fixtures/default/src_file.js']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'versioner', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
