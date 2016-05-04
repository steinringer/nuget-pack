# nuget-pckg [![NPM version](https://badge.fury.io/js/nuget-pckg.png)](http://badge.fury.io/js/nuget-pckg)
Node.js module to pack nuGet packages from solution folder.

Install this node module using npm install nuget-pckg --save-dev.

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

1.0.5 - updated nuget.exe to version 3.3
1.0.6 - updated dependencies find (0.1.7 -> 0.2.4) and nuget-runner (0.1.5 -> 0.1.8)