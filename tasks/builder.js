/*
 * grunt-builder
 * https://github.com/amkirwan/grunt-builder
 *
 * Copyright (c) 2014 Anthony Kirwan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var shell = require('shelljs');
  var semver = require('semver');

  grunt.registerMultiTask('builder', 'Grunt plugin for versioning, building and tagging your Git project.', function(versionType) {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      bump: true,
      file: 'package.json',
      gitAdd: true,
      gitCommit: true,
      gitPush: true,
      gitPushTag: true,
      readmeText: 'Current Version:',
      tagMessage: 'Version <%= newVersion %>',
      commitMesage: 'Version <%= newVersion %>'
    });

    var newVersion;
    var versionFileRegExp = /^([\d||A-a|.|-]+)$/im;
    var versionJSFileRegExp = /([\'|\"]?version[\'|\"]?\s*[:|=]\s*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;
    var readmeRegExp = new RegExp("(^" + options.readmeText + ".*\\[)([\\d|.|\\-|a-z]+)(\\].*\\/)([\\d|.|\\-|a-z]+)(\\).*)", "img");

    // setup the newVersion
    (function() {
      if (!grunt.file.exists(options.file)) {
        grunt.log.error('Version source file "' + options.file + '" not found.');
      }
      // set versionType
      options.versionType = options.versionType || versionType || 'patch';

      // get the current version
      // var version = grunt.file.match(options.matchBase, 'package.json') ? grunt.file.readJSON(options.file).version : grunt.file.read(options.file);
      var version = (grunt.file.isMatch({matchBase: true}, '*.json', options.file)) ? grunt.file.readJSON(options.file).version : grunt.file.read(options.file);
      bumpIt(version); // set the newVersion
    })();

    var templateData = {
      data: {
        newVersion: newVersion
      }
    };

    // replace 'newVersion in the template', and update the options message
    options.tagName = grunt.template.process(options.tagName || 'v<%= newVersion %>', templateData);
    options.commitMessage = grunt.template.process(options.commitMessage || 'release <%= newVersion %>', templateData);
    options.tagMessage = grunt.template.process(options.commitMessage || 'version <%= newVersion %>', templateData);

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var content = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.error('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).toString();
    
      var updatedContent = bumpVersion(content);

      // Write the destination file.
      grunt.file.write(f.dest, updatedContent);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });

    function gitAdd(file) {
      shell.exec('git add ' + file.src);
    }

    function bumpIt(parsedVersion) {
      if (options.setVersion !== undefined && newVersion === undefined) {
        newVersion = options.setVersion;
      } else if (newVersion === undefined) {
        newVersion = semver.inc(parsedVersion, options.versionType || 'patch');
      }
      return newVersion;
    }

    function bumpVersion(content) {
      var newContent;
      if (content.match(readmeRegExp)) {
        newContent = content.replace(readmeRegExp, function(match, leadText, parsedVersion, urlUpToTag, versionUrl, endText,  offset, string) {
          return  leadText + newVersion + urlUpToTag + options.tagName + endText;
        });    
      } else if (content.match(versionJSFileRegExp)) {
        newContent = content.replace(versionJSFileRegExp, function(match, prefix, parsedVersion, suffix) {
          return prefix + newVersion + suffix;
        });
      } else if (content.match(versionFileRegExp)) {
        newContent = content.replace(versionFileRegExp, function(match, parsedVersion) {
          return newVersion;
        });
      }
      return newContent;
    } 

  });
};
