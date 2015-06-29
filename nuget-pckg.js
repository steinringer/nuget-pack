'use strict';
var fs = require('fs'),
    Nuget = require('nuget-runner'),
    path = require('path'),
    find = require('find');

var Nu = function (options) {
    this.options = options;
}

Nu.prototype.getNuspecs = function (callback) {
	var self = this;
    var dir = this.options.baseDir;
    if (!fs.existsSync(dir))
        return callback(new Error('Provided baseDir does not exist'), null);
    
    if (!path.isAbsolute(this.options.baseDir)) {
        dir = path.join(__dirname, this.options.baseDir);
    }
    find.file(/\w\.nuspec$/, dir, function (files) {
        if (callback && typeof callback === 'function') {
            var filtered = files.filter(function (f) {
		        return !shouldSkip(f);
            });
	        if (filtered.length == 0)
                callback(new Error('No .nuspec files match the criteria'), null);
            else
                callback(null, filtered);
        } else {
            throw new Error('You have to provide callback function.');
        }
		
    });

    var shouldSkip = function (nuspecFile) {
        if (self.options.skip == null) return false;
        
        var should = false;    
        
        self.options.skip.forEach(function (skip) {
	        var regex = new RegExp(skip);
            should = should || regex.test(nuspecFile);
        });

	    
	    return should;
    }

};

Nu.prototype.resolveOutputPath = function () {
    var self = this;
	if (self.options.outputPath)
		return self.options.outputPath;

    return path.join(__dirname, self.options.baseDir);
}

Nu.prototype.pack = function (callback) {
    var self = this;

    var nugetExePath = path.join(__dirname, 'bin/nuget.exe');
    
    var nuget = Nuget({
        nugetPath: nugetExePath,
        verbosity: 'quiet'
    });
    
    self.getNuspecs(function (error, res) {
        var resolvedCnt = 0;
        var expectedCnt = res.length;

        var outputDir = self.resolveOutputPath();
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        res.forEach(function (item) {
            
	        nuget.pack({
		        spec: item,
		        outputDirectory: outputDir
	        })
            .then(function () {
                resolvedCnt++;
	            if (resolvedCnt == expectedCnt && callback && typeof callback == 'function')
		            callback();
            });


        });
    });
}

module.exports = Nu;