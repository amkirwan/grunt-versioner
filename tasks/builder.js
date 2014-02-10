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

  var newVersion; 
  var versionFileRegExp = /^([\d||A-a|.|-]+)$/im;
  var versionJSFileRegExp = /([\'|\"]?version[\'|\"]?\s*[:|=]\s*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;
  var readmeRegExp;  
  var versionType;
  var tagName;
  var tagMessage;
  var commitMessage;

  grunt.registerMultiTask('builder', 'Grunt plugin for versioning, building and tagging your Git project.', function(versionType) {
    // reset newVersion for each grunt task
    newVersion = undefined;

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      bump: true,
      file: 'package.json',
      srcFiles: [],
      readmeText: 'Current Version:',
      tagMessage: 'Version <%= newVersion %>',
      commitMesage: 'Version <%= newVersion %>'
    });
    // create readmeRegExp with option
    readmeRegExp = new RegExp("(^" + options.readmeText + ".*\\[)([\\d|.|\\-|a-z]+)(\\].*\\/)([\\d|.|\\-|a-z]+)(\\).*)", "img");

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
      bumpIt(version, options); // set the newVersion
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
    
      var updatedContent = bumpVersion(content, options);

      // Write the destination file.
      grunt.file.write(f.dest, updatedContent);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });


    function gitAdd(file) {
      shell.exec('git add ' + file.src);
    }

  });

  

  var bumpIt = function(parsedVersion, opts) {
    if (opts.setVersion !== undefined && newVersion === undefined) {
      newVersion = opts.setVersion;
    } else if (newVersion === undefined) {
      newVersion = semver.inc(parsedVersion, opts.versionType || 'patch');
    }
    return newVersion;
  };

  var bumpVersion = function(content, opts) {
    var newContent;
    if (content.match(readmeRegExp)) {
      newContent = content.replace(readmeRegExp, function(match, leadText, parsedVersion, urlUpToTag, versionUrl, endText,  offset, string) {
        return  leadText + newVersion + urlUpToTag + opts.tagName + endText;
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
  }; 

};
