/*
 * grunt-versioner
 * https://github.com/amkirwan/grunt-versioner
 *
 * Copyright (c) 2014 Anthony Kirwan
 * Licensed under the MIT license.
 *
 * @version 0.1.6
 */

'use strict';

module.exports = function(grunt) {

  var shell = require('shelljs');
  var semver = require('semver');

  grunt.registerMultiTask('versioner', 'Grunt plugin for versioning, building, tagging your Git project and publishing to NPM.', function(versionType) {

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
      readmeText: 'Current Version:',
      pushTo: 'origin',
      branch: 'master',
      npm: false,
      mode: 'production',
      configs: []
    });

    var pkgName;
    var newVersion;
    var versionFileRegExp = /^([\d||A-a|.|-]+)$/im;
    var versionJSFileRegExp = /([\'|\"]?version[\'|\"]?\s*[:|=]\s*[\'|\"]?)(\d[\d||A-a|.|-]*)([\'|\"]?)/i;
    var readmeRegExp = new RegExp("(^" + options.readmeText + ".*\\[)([\\d|.|\\-|a-z]+)(\\].*\\/)([\\d|.|\\-|a-z]+)(\\).*)", "img");
    var yuidocRegExp = /(\*\s*@version\s+)([\d||A-a|.|-]+)(.*)/im;

    if (grunt.option('bumpOnly') === true) {
      options.bump = true;
      options.gitAdd = false;
      options.gitCommit = false;
      options.gitPush = false;
      options.gitTag = false;
      options.gitPushTag = false;
      options.npm = false;
    } else if (grunt.option('commitOnly') === true) {
      options.bump = false;
      options.gitAdd = true;
      options.gitCommit = true;
      options.gitPush = true;
      options.gitTag = true;
      options.gitPushTag = true;
      options.npm = false;
    } else if (grunt.option('npmOnly') === true) {
      options.bump = false;
      options.gitAdd = false;
      options.gitCommit = false;
      options.gitPush = false;
      options.gitTag = false;
      options.gitPushTag = false;
      options.npm = true;
    }

    // init function setup the newVersion
    (function() {
      if (!grunt.file.exists(options.file)) {
        grunt.log.error('Version source file "' + options.file + '" not found.');
      }

      // set pkgName
      pkgName = grunt.file.readJSON('package.json').name;

      // set versionType
      options.versionType = (options.versionType || versionType || 'patch');

      // get the current version
      var version = (grunt.file.isMatch({matchBase: true}, '*.json', options.file)) ? grunt.file.readJSON(options.file).version : grunt.file.read(options.file);
      setNewVersion(version); // set the newVersion
    })();

    var templateData = {
      data: {
        newVersion: newVersion
      }
    };

    function formatMessage(msg) {
      return '"' + msg + '"';
    }

    // replace 'newVersion in the template', and update the options message
    options.tagName = grunt.template.process(options.tagName || options.tagPrefix + "<%= newVersion %>", templateData);
    options.commitMessage = formatMessage(grunt.template.process(options.commitMessage || options.commitMessagePrefix + "<%= newVersion %>", templateData));
    options.tagMessage = formatMessage((options.tagMessage || options.tagMessagePrefix + options.tagName));


    function exec(opts) {
      if (options.mode === 'production') {
        shell.exec(opts.cmd);
        if (shell.error()) {
          grunt.log.error(opts.errMsg);
        } else {
          grunt.log.ok(opts.msg);
        }
      } else {
        grunt.log.ok('cmd: ' + opts.cmd);
      }
    }

    // git functions
    function gitAdd() {
      exec({cmd: 'git add -A',
            msg: 'Added files to the git index',
            errMsg: 'Cannot add files to the git index'});
    }

    function gitCommit() {
      exec({cmd: 'git commit -m ' + options.commitMessage,
            msg: "Committed as " + options.commitMessage,
            errMsg: 'Cannot commit changes'});
    }

    function gitTag() {
      exec({cmd: 'git tag -a ' + options.tagName + ' -m ' + options.tagMessage,
           msg: 'Tagged as ' + options.tagName,
           errMsg: 'Cannot create tag ' + options.tagName});
    }

    function gitPushTag() {
      exec({cmd: 'git push ' + options.pushTo + ' --tags',
            msg: 'Tag pushed to ' + options.pushTo,
            errMsg: 'Cannot push tag ' + options.tagName + ' to ' + options.pushTo });
    }

    function gitPush() {
      exec({cmd: 'git push ' + options.pushTo + ' ' + options.branch,
            msg: 'Pushed changes to remote ' + options.pushTo + ' branch ' + options.branch,
            errMsg: 'Cannot push to remote ' + options.pushTo + ' branch ' + options.branch});
    }

    function publishToNpm() {
      var pkgLatest = pkgName + '@' + newVersion;
      exec({cmd: 'npm publish --tag ' + pkgLatest,
            msg: 'Published ' + pkgLatest + ' to NPM.',
            errMsg: 'Cannot publish ' + pkgLatest + ' to NPM.' });
      exec({cmd: 'npm tag ' + pkgLatest + ' latest',
            msg: 'Set npm registry latest version to: ' + pkgLatest,
            errMsg: 'Cannot set npm registry latest version to: ' + pkgLatest });
    }

    function setNewVersion(parsedVersion) {
      if (!options.bump) {
        return (newVersion = parsedVersion);
      }

      if (options.setVersion !== undefined && newVersion === undefined) {
        newVersion = options.setVersion;
      } else if (options.versionType === 'git' && newVersion === undefined) {
        var gitDescribe = shell.exec('git describe ' + options.gitDescribeOptions).output;
        if (options.tagPrefix.length >= '1') {
          newVersion = gitDescribe.substr(1, gitDescribe.length - 1).replace(/(\r\n|\n|\r)/gm,"");
        } else {
          newVersion = gitDescribe.replace(/(\r\n|\n|\r)/gm,"");
        }
      } else if (options.versionType === 'gitrev' && newVersion === undefined) {
        var gitRev = shell.exec('git rev-parse --short HEAD').output;
        newVersion = parsedVersion + '-' + gitRev.replace(/(\r\n|\n|\r)/gm,'');
      } else if (newVersion === undefined) {
        newVersion = semver.inc(parsedVersion, options.versionType || 'patch');
      }
      grunt.log.ok('Version set to: ' + newVersion);
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
        newContent = newContent.replace(yuidocRegExp, function(match, prefix, parsedVersion) {
          return prefix + newVersion;
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

      if (options.bump) {
        var updatedContent = updateContent(content);

        // Write the destination file
        grunt.file.write(f.dest, updatedContent);

        // Print a success message.
        grunt.log.writeln('File "' + f.dest + '" updated.');
      }
    });
    
    if (options.configs.length) {
      options.configs.forEach(function(configProp) {
        var cfg = grunt.config(configProp);
        cfg.version = newVersion;
        grunt.config(configProp, cfg);
      });
    }

    // git commit and push
    if (options.gitAdd) { gitAdd(); }
    if (options.gitAdd && options.gitCommit) { gitCommit(); }
    if (options.gitCommit && options.gitPush) { gitPush(); }
    if (options.gitTag) { gitTag(); }
    if (options.gitTag && options.gitPushTag) { gitPushTag(); }
    if (options.npm) { publishToNpm(); }

  });

  grunt.registerTask('versioner:bumpOnly', 'Increment the version only.', function(task, versionType) {
    grunt.option('bumpOnly', true);
    grunt.option('commitOnly', false);
    grunt.option('npmOnly', false);
    grunt.task.run('versioner:' + task + ':' + (versionType || ''));
  });


  grunt.registerTask('versioner:commitOnly', 'Commit, tag and push to remote.', function(task) {
    grunt.option('commitOnly', true);
    grunt.option('bumpOnly', false);
    grunt.option('npmOnly', false);
    grunt.task.run('versioner:' + task);
  });

  grunt.registerTask('versioner:npmOnly', 'Publish latest version to npm only.', function(task) {
    grunt.option('npmOnly', true);
    grunt.option('bumpOnly', false);
    grunt.option('commitOnly', false);
    grunt.task.run('versioner:' + task);
  });

};
