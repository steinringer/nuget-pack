# nuget-pckg [![NPM version](https://badge.fury.io/js/nuget-pckg.png)](http://badge.fury.io/js/nuget-pckg)
Node.js module to pack nuGet packages from solution folder.

Install this node module using npm install nuget-pckg --save-dev

```javascript
var Ng = require('nuget-pckg');

var directory = 'solution-folder';
var ng = new Ng({
    baseDir: directory,
    outputPath: 'C:\\deploy'
});
ng.pack();
```
