# nuget-pack [![NPM version](https://badge.fury.io/js/nuget-pack.png)](http://badge.fury.io/js/nuget-pack)
Node.js module to pack nuGet packages from solution folder.

Install this node module using npm install nuget-pack --save-dev

```javascript
var Ng = require('nuget-pack');

var directory = 'solution-folder';
var ng = new Ng({
    baseDir: directory,
    outputPath: 'C:\\deploy'
});
ng.pack();
```
