'use strict';
var fs = require('fs'),
	Nuget = require('nuget-runner'),
	path = require('path'),
	find = require('find');

var Nu = function (options) {
	this.options = options;
}

var shouldSkip = function (options, nuspecFile) {
	if (options.skip == null) options.skip = [];
	options.skip.push('node_modules');
	var should = false;
	
	options.skip.forEach(function (skip) {
		var regex = new RegExp(skip);
		should = should || regex.test(nuspecFile);
	});
	return should;
}

var resolveDir = function (self) {
	var dir = self.options.baseDir;
	if (!path.isAbsolute(self.options.baseDir)) {
		dir = path.join(__dirname, self.options.baseDir);
	}
	return dir;
}

Nu.prototype.getNuspecs = function (callback, options) {
	options = options || {};
	
	var self = this;
	var dir = resolveDir(self);
	
	if (!fs.existsSync(dir))
		return callback(new Error('Provided baseDir does not exist'), null);
	
	find.file(/\w\.nuspec$/, dir, function (files) {
		if (callback && typeof callback === 'function') {
			var filtered = files.filter(function (f) {
				return !shouldSkip(options, f);
			});
			if (filtered.length == 0)
				callback(new Error('No .nuspec files match the criteria'), null);
			else
				callback(null, filtered);
		} else {
			throw new Error('You have to provide callback function.');
		}
		
	});
	return;
};

Nu.prototype.getNupkgs = function (callback) {
    
}

Nu.prototype.resolveOutputPath = function (self, options) {
	var outputDirectory = options.outputDirectory;
	if (outputDirectory) {
		return outputDirectory;
	}
	return path.join(__dirname, self.options.baseDir);
}

Nu.prototype.pack = function (callback, options) {
	options = options || {};
	var self = this;
	
	var nugetExePath = path.join(__dirname, 'bin/nuget.exe');
	
	var nuget = Nuget({
		nugetPath: nugetExePath,
		verbosity: 'quiet'
	});
	self.getNuspecs(function (error, res) {
		var resolvedCnt = 0;
		var expectedCnt = res.length;
		var outputDir = self.resolveOutputPath(self, options);
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
				if (resolvedCnt === expectedCnt && callback && typeof callback == 'function')
					callback();
			});


		});
	}, options);
}

Nu.prototype.add = function (callback, options) {
	options = options || {};
	var nugetExePath = path.join(__dirname, 'bin/nuget.exe');
	var nuget = Nuget({
		nugetPath: nugetExePath,
		verbosity: 'quiet'
	});
	
	nuget.add({
		nupkg: options.nupkg,
		source: options.source
	}).then(function () {
		if (callback && typeof callback === 'function') {
			callback();
		}
	});
}

module.exports = Nu;