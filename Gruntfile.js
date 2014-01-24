/*
 * grunt-builder
 * https://github.com/amkirwan/grunt-builder
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
    builder: {
      patch: {
        options: { 
          file: 'test/fixtures/default/VERSION'
        },
        files: {
          'tmp/patch/VERSION': ['test/fixtures/default/VERSION'],
          'tmp/patch/package.json': ['test/fixtures/default/package.json'],
          'tmp/patch/bower.json': ['test/fixtures/default/bower.json'],
          'tmp/patch/README.md': ['test/fixtures/default/README.md']
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
          'tmp/minor/README.md': ['test/fixtures/default/README.md']
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
  grunt.registerTask('test', ['clean', 'builder', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
