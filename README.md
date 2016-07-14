# nuget-pckg [![NPM version](https://badge.fury.io/js/nuget-pckg.png)](http://badge.fury.io/js/nuget-pckg)
Node.js module to pack nuGet packages from solution folder. Included a `gulpfile.js` to illustrate the functionality. Module is based on [node-nuget-runner](https://github.com/mikeobrien/node-nuget-runner) and uses Nuget.exe 3.3.0.

It privides a stream based API for gathering multiple `*.nuspec` files, packing them intu `*.nupkg` packages and adding to remote server with Nuget Add command. Look [here](https://docs.nuget.org/consume/command-line-reference#add-command) for more details.

Install this node module using npm install nuget-pckg --save-dev.

#### Usage:
```javascript
var Ng = require('nuget-pckg'),
path = require('path');

var ng = new Ng({
    baseDir: path.resolve('.')
});

ng.getNuspecs({
    skip: ['obj'],  //patterns to be skipped when searching for nuspec in baseDir
    print: true
})
.pipe(ng.pack({
    outputDirectory: './nupkg-publish-folder',
    print: true
}))
.pipe(ng.add({
    source: './tests/server',
    print: true
}));

```
See the [gulpfile](https://github.com/mcsdodo/nuget-pack/blob/dev/gulpfile.js) for additional examples.

##### Test
```
npm test
```

##### Old usage - up to version 1.0.6:

```javascript
var Ng = require('nuget-pckg');

var directory = 'solution-folder';
var ng = new Ng({
    baseDir: directory,
    outputPath: 'C:\\deploy',
    skip: ['some-regex']
});
ng.pack();
```

##### Changelog:

2.0.0 - not backward compatible. Introduced stream API, added support for Nuget Add command, Nuget.exe updated. Method signatures changed (see description above).\
1.0.6 - updated dependencies find (0.1.7 -> 0.2.4) and nuget-runner (0.1.5 -> 0.1.8)\
1.0.5 - updated nuget.exe to version 3.3