'use strict';
var fs = require('fs'),
	Nuget = require('nuget-runner'),
	path = require('path'),
	find = require('find'),
	map = require('map-stream'),
	xml2json = require('simple-xml2json'),
	Readable = require('stream').Readable;


function Nu(options) {
	this.options = options;
}

function NuObject(nuspec, nupkg) {
	this.nuspec = nuspec;
	this.nupkg = nupkg;
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

var resolveNupkgPath = function(nuspecPath, outputDir) {
	var nuspecFileContents = fs.readFileSync(nuspecPath);
	var json = xml2json.parser(nuspecFileContents.toString());
	var id = json.package.metadata.id;
	var version = json.package.metadata.version;
	var packedNupkgPath = path.join(outputDir, id + "." + version + ".nupkg");
    return packedNupkgPath;
}

var resolveOutputPath = function (self, options) {
    var outputDirectory = options.outputDirectory;
    if (outputDirectory) {
        return outputDirectory;
    }
    return path.join(__dirname, self.options.baseDir);
}

var getInstance = function() {
	var nugetExePath = path.join(__dirname, 'bin/nuget.exe');
	var nuget = Nuget({
		nugetPath: nugetExePath,
		verbosity: 'quiet'
	});
    return nuget;
}

Nu.prototype.getNuspecs = function (options, callback) {
	options = options || {};
	var finishCallback = callback || function () { };
	
	if (typeof finishCallback !== 'function') {
		throw new Error('Callback has to be an function!');
	}

	var rs = new Readable({ objectMode: true });
	
	var self = this;
	var dir = resolveDir(self);
	
	var files = find.fileSync(/\w\.nuspec$/, dir);
	
	var filtered = files.filter(function (f) {
		return !shouldSkip(options, f);
	});

	filtered.forEach(function (f) {
	    var obj = new NuObject(f);
		rs.push(obj);
		if (options.log) {
			console.log(obj.nuspec);
		}
	});
	
	rs.push(null);
	finishCallback();
	return rs;
}

Nu.prototype.pack = function (options, callback) {
	options = options || {};
	var finishCallback = callback || function () { };
	
	if (typeof finishCallback !== 'function') {
	    throw new Error('Callback has to be an function!');
	}
    var self = this;
    var nuget = getInstance();
	
	var outputDir = resolveOutputPath(self, options);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}
	
	var log = function(spec, packedNupkgPath) {
	    if (options.log) {
			console.log("Packed: " + spec + " to " + packedNupkgPath);
	    }
	}
	
	if (options.spec) {
	    nuget.pack({
	        spec: options.spec,
	        outputDirectory: outputDir
		}).then(function () {
			var packedNupkgPath = resolveNupkgPath(options.spec, outputDir);
	        log(options.spec, packedNupkgPath);
	        finishCallback();
	    });
	}
	
	return map(function (data, callback) {
		nuget.pack({
			spec: data.nuspec,
			outputDirectory: outputDir
		}).then(function () {
			var packedNupkgPath = resolveNupkgPath(data.nuspec, outputDir);
			log(data.nuspec, packedNupkgPath);
		    data.nupkg = packedNupkgPath;		    
		    callback(null, data);
			finishCallback();
		});
	});
}

Nu.prototype.add = function (options, callback) {
	options = options || {};
	var finishCallback = callback || function () { };
	
	if (typeof finishCallback !== 'function') {
		throw new Error('Callback has to be an function!');
	}
	var nuget = getInstance();

	var log = function(nupkg) {
		if (options.log) {
			console.log("Added: " + nupkg + " to " + options.source);
		} 
	}
	

	if (options.nupkg) {
		nuget.add({
			nupkg: options.nupkg,
			source: options.source
		}).then(function () {
		    log(options.nupkg);
			finishCallback();
		});;
	} else {
		return map(function (data, callback) {
			nuget.add({
				nupkg: data.nupkg,
				source: options.source
			}).then(function () {
			    log(data.nupkg);
				callback(null, data);
				finishCallback();
			});
		});
	}
}

module.exports = Nu;