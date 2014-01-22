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
  var readmeRegExp;  

  grunt.registerMultiTask('builder', 'Grunt plugin for versioning, building and tagging your Git project.', function(versionType) {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      bump: true,
      files: ['package.json'],
      readmeText: 'Current Version:',
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%'
    });

    readmeRegExp = new RegExp("(^" + options.readmeText + ".*\\[)([\\d|.|\\-|a-z]+)(\\].*\\/)([\\d|.|\\-|a-z]+)(\\).*)", "img");

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
    
      content = bumpVersion(options, content);

      // Write the destination file.
      grunt.file.write(f.dest, content);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

  var bumpIt = function(parsedVersion) {
    newVersion = semver.inc(parsedVersion, versionType || 'patch');
    return newVersion;
  };

  var bumpVersion = function(opts, content) {
    var newContent;
    if (content.match(versionFileRegExp)) {
      newContent = content.replace(versionFileRegExp, function(match, parsedVersion) {
        return bumpIt(parsedVersion);
      });
    } else if (content.match(readmeRegExp)) {
      newContent = content.replace(readmeRegExp, function(match, leadText, parsedVersion, urlUpToTag, versionUrl, endText,  offset, string) {
        return  leadText + bumpIt(parsedVersion) + urlUpToTag + opts.tagName.replace('%VERSION%', bumpIt(parsedVersion)) + endText;
      });
    } else if (content.match(versionRegExp)) {
      newContent = content.replace(versionRegExp, function(match, prefix, parsedVersion, suffix) {
        return prefix + bumpIt(parsedVersion) + suffix;
      });
    }
    return newContent;
  }; 
};
