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
      gitTag: true,
      gitPushTag: true,
      gitDescribeOptions: '--tags --always --dirty=-d',
      tagPrefix: 'v',
      commitMessagePrefix: 'Release: ',
      tagMessagePrefix: 'Version: ',
      readmeText: 'Current Version:'
    });

    var newVersion;
    var versionFileRegExp = /^([\d||A-a|.|-]+)$/im;
    var versionJSFileRegExp = /([\'|\"]?version[\'|\"]?\s*[:|=]\s*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;
    var readmeRegExp = new RegExp("(^" + options.readmeText + ".*\\[)([\\d|.|\\-|a-z]+)(\\].*\\/)([\\d|.|\\-|a-z]+)(\\).*)", "img");

    // init function setup the newVersion
    (function() {
      if (!grunt.file.exists(options.file)) {
        grunt.log.error('Version source file "' + options.file + '" not found.');
      }
      // set versionType
      options.versionType = options.versionType || versionType || 'patch';

      // get the current version
      var version = (grunt.file.isMatch({matchBase: true}, '*.json', options.file)) ? grunt.file.readJSON(options.file).version : grunt.file.read(options.file);
      if (options.bump) {
        setNewVersion(version); // set the newVersion
      }
    })();

    var templateData = {
      data: {
        newVersion: newVersion
      }
    };

    // replace 'newVersion in the template', and update the options message
    options.tagName = grunt.template.process(options.tagName || options.tagPrefix + "<%= newVersion %>", templateData);
    options.commitMessage = grunt.template.process(options.commitMessage || options.commitMessagePrefix + "<%= newVersion %>", templateData);
    options.tagMessage = (options.tagMessage || options.tagMessagePrefix + options.tagName);

    // git functions
    function gitAdd(file) {
      shell.exec('git add ' + file.src);
    }

    function gitCommit() {
      shell.exec('git commit -m' + options.commitMessage); 
    }

    function gitTag() {
      shell.exec('git tag -a' + options.tagName + ' -m ' + options.tagMessage);
    }

    function gitPushTag() {
      shell.exec('git push --tags ');
    }

    function gitPush() {
      shell.exec('git push', 'pushed to remote');
    }

    function setNewVersion(parsedVersion) {
      if (options.setVersion !== undefined && newVersion === undefined) {
        newVersion = options.setVersion;
      } else if (options.versionType === 'git' && newVersion === undefined) {
        shell.exec('git describe ' + options.gitDescribeOptions);
      } else if (newVersion === undefined) {
        
        newVersion = semver.inc(parsedVersion, options.versionType || 'patch');
      }
      return newVersion;
    }

    function updateContent(content) {
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
    
      var updatedContent = updateContent(content);

      // Write the destination file if set otherwise write back to the src file.
      if (f.dest) {
        grunt.file.write(f.dest, updatedContent);
      } else {
        grunt.file.write(f.src, updatedContent);
      }

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" updated.');

      if (options.gitAdd) { 
        gitAdd(f);
      }
    });

    // git commit and push
    if (options.gitTag) { gitCommit(); }
    if (options.gitTag) { gitTag(); }
    if (options.gitPush) { gitPush(); }
    if (options.gitPushTag) { gitPushTag(); }

  });
};
