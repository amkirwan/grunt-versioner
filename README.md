# grunt-versioner

> Grunt plugin for versioning, building and tagging your Git project.

Current Version: [0.1.10](https://github.com/amkirwan/grunt-versioner/releases/v0.1.10)

[![Circle CI](https://circleci.com/gh/amkirwan/grunt-versioner.svg?style=svg)](https://circleci.com/gh/amkirwan/grunt-versioner)

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-versioner --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-versioner');
```

## The "versioner" task

### Overview

In your project's Gruntfile, add a section named `versioner` to the data object passed into `grunt.initConfig()`.

This shows all of the configuration options and their default values. Individual settings can be given for the different versioning types patch, minor, major and git. The files section is where to put the files you would like the script to update.  Most users will only need to create a default task.

```js
grunt.initConfig({
  versioner: {
    options: {
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
      npm: true,
      mode: 'production',
      configs: []
    },
    default {
      files: {
        './package.json': ['./package.json'],
        './bower.json': ['./bower.json'],
        './README.md': ['./README.md'],
        './src/lib/src_file.js': ['./src/lib/src_file.js']
      }
    },
    patch: {
      options: {
        file: './VERSION'
      },
      src: ['./package.json', './bower.json', './README.md']
    }
  },
});
```

When including a README.md file to update the script looks for a line like the one below to update the both the version link and url. This way your README.md file will maintain a link to your latests release.


```
Current Version: **[1.0.2](https://github.com/foobar/releases/tag/v1.0.2)**
```

Additionally any files with YUIdoc style version tags `* @version 1.0.2` will be updated to the latest version as well if the files are included in the `files` configuration.

### Usage Examples

```bash
$ grunt versioner:default
>> Version bumped to 0.0.2
>> Committed as "Release v0.0.2"
>> Tagged as "v0.0.2"
>> Pushed to origin

$ grunt versioner:default:bump
>> Version bumped to 0.0.3
>> Committed as "Release v0.0.3"
>> Tagged as "v0.0.3"
>> Pushed to origin

$ grunt versioner:default:minor
>> Version bumped to 0.1.0
>> Committed as "Release v0.1.0"
>> Tagged as "v0.1.0"
>> Pushed to origin

$ grunt versioner:default:major
>> Version bumped to 1.0.0
>> Committed as "Release v1.0.0"
>> Tagged as "v1.0.0"
>> Pushed to origin

$ grunt versioner:default:git
>> Version bumped to 1.0.0-1-ge96c
>> Committed as "Release v1.0.0-1-ge96c"
>> Tagged as "v1.0.0-1-ge96c"
>> Pushed to origin

$ grunt versioner:default:gitrev
>> Version bumped to ca40b1c
>> Committed as "Release ca40b1c"
>> Tagged as "ca40b1c"
>> Pushed to origin
```

If you want to jump to an exact version, you can use the ```setversion``` tag in the command line.

```bash
$ grunt versioner --setVersion=2.0.1
>> Version bumped to 2.0.1
>> Committed as "Release v2.0.1"
>> Tagged as "v2.0.1"
>> Pushed to origin
```

If you need to run another task between bumping the version and commiting you can use the tasks `versioner:bumpOnly`, `versioner:commitOnly`, and `versioner:npmOnly`

```
$ grunt versioner:bumpOnly:default:minor
$ grunt uglify
$ grunt versioner:commitOnly:default
$ grunt versioner:npmOnly:default
```

To publish your project to NPM and to set a tag. Setting an `npmTag` is not required. A tag name should not be SemVer range.

```
$ grunt versioner:npmOnly:default --npmTag v1.2-latest
```

### Options

**options.bump** - When grunt versioner is run the files will be bumped. 

Type: `Boolean`
Default value: `true`

**options.file** - File that is read to current the current Version from. This should either be a json file in the format of package.json or bower.json with the version property or it can be VERSION file that only contains the version.

Type: `String`
Default value: `package.json`

**options.gitAdd** - The files that are bumped will be add to the git index.

Type: `Boolean`
Default value: `true`

**options.gitCommit** - The files will added to the git index will be committed. 

Type: `Boolean`
Default value: `true`

**options.gitPush** - The changes commited will be pushed to git origin.

Type: `Boolean`
Default value: `true`

**options.gitTag** - Create tag of the latest version.

Type: `Boolean`
Default value: `true`

**options.pushTo** - Remote repo to push to

Type: `String`
Default value: `origin`

**options.gitPushTag** - The tag created for the new version will be pushed to the git origin.

Type: `Boolean`
Default value: `true`

**options.branch** - The git branch to push the changes.

Type: `String`
Default value: `master`

**options.npm** - Publish to NPM.

Type: `boolean`
Default value: `true`

**options.gitDescribeOptions** - Options passed to git describe when using to create a version tag.

Type: `String`
Default: `gitDescribeOptions: '--tags --always --dirty=-d'`
 
**options.readmeText** - If updating version information in your README.md file. This is the text before the version information. 

Type: `String`
Default value `Current Version:`

**options.tagPrefix** - Prefix text before your git tag.

Type: `String`
Default value `v`

**options.commitMessagePrefix** - Prefix text before your commit message. The default full message is `Release: 0.2.2`.

Type: `String`
Default value `Release: `

**options.tagMessagePrefix** - Prefix for the git annotayted tags. The default full message will be `Version: 0.2.2`.

Type: `String`
Default value `Message: `

**options.mode** - Mode that it should run in. The accepted values are `test` and `production`. The should only be switched to `test` when running the tests. This prints out what commands git would have run in produciton.

Type: `Array`
Default value `[]: `

**options.configs** - When you load package.json into a grunt config variable such as `pkg` that needs to have the version updated as the grunt process runs. Adding any vars here such as `pkg` will update any `version` keys on those config properties so that the correct version is used when using `pkg.version` in your tasks.

```
versioner: {
  options: {
    bump: true,
    configs: ['pkg']
  }
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

