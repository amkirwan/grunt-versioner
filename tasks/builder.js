/*
 * grunt-builder
 * https://github.com/amkirwan/grunt-builder
 *
 * Copyright (c) 2014 Anthony Kirwan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var semver = require('semver');
  var newVersion; 
  var versionType;
  var versionFileRegExp = /^([\d||A-a|.|-]+)$/im;
  var versionRegExp = /([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;

  grunt.registerMultiTask('builder', 'Grunt plugin for versioning, building and tagging your Git project.', function(versionType) {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      bump: true,
      files: ['package.json']
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var content = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).toString();
    
      content = bumpVersion(content);

      // Write the destination file.
      grunt.file.write(f.dest, content);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

  var bumpVersion = function(content) {
    var newContent = content.replace(versionFileRegExp, function(match, parsedVersion) {
      return semver.inc(parsedVersion, versionType || 'patch');
    });
    return newContent;
  }; 
};
