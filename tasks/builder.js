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
  var versionFileRegExp = /^([\d||A-a|.|-]+)$/im;
  var versionRegExp = /([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;
  var readmeRegExp;  
  var versionType;
  var tagName;
  var tagMessage;
  var commitMessage;

  grunt.registerMultiTask('builder', 'Grunt plugin for versioning, building and tagging your Git project.', function(type) {
    // set versionType
    versionType = type || 'patch';
    // reset newVersion for each grunt task
    newVersion = undefined;

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      bump: true,
      file: 'package.json',
      readmeText: 'Current Version:',
      tagMessage: 'Version <%= newVersion %>',
      commitMesage: 'Version <%= newVersion %>',
    });

    var setUp = function() {
      if (!grunt.file.exists(options.file)) {
        grunt.log.warn('Version source file "' + options.file + '" not found.');
      }
      var version = grunt.file.read(options.file);
      bumpIt(version);
    };
    setUp();

    var templateData = {
      data: {
        newVersion: newVersion
      }
    };

    // replace 'version in the template'
    options.tagName = grunt.template.process(options.tagName || 'v<%= newVersion %>', templateData);
    options.commitMessage = grunt.template.process(options.commitMessage || 'release <%= newVersion %>', templateData);
    options.tagMessage = grunt.template.process(options.commitMessage || 'version <%= newVersion %>', templateData);
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
    
      var updatedContent = bumpVersion(content, options);

      // Write the destination file.
      grunt.file.write(f.dest, updatedContent);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

  var bumpIt = function(parsedVersion) {
    if (newVersion === undefined) {
      newVersion = semver.inc(parsedVersion, versionType || 'patch');
    }
    return newVersion;
  };

  var bumpVersion = function(content, opts) {
    var newContent;
    if (content.match(readmeRegExp)) {
      newContent = content.replace(readmeRegExp, function(match, leadText, parsedVersion, urlUpToTag, versionUrl, endText,  offset, string) {
        return  leadText + newVersion + urlUpToTag + opts.tagName + endText;
      });    
    } else if (content.match(versionRegExp)) {
      newContent = content.replace(versionRegExp, function(match, prefix, parsedVersion, suffix) {
        return prefix + newVersion + suffix;
      });
    } else if (content.match(versionFileRegExp)) {
      newContent = content.replace(versionFileRegExp, function(match, parsedVersion) {
        return newVersion;
      });
    }
    return newContent;
  }; 

};
