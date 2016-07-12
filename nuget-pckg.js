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

Nu.prototype.getNuspecsStream = function (options, callback) {
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
		if (options.print) {
			console.log(obj.nuspec + "\r\n");
		}
	});
	
	rs.push(null);
	finishCallback();
	return rs;
}

Nu.prototype.packStream = function (options, callback) {
	options = options || {};
	var finishCallback = callback || function () { };
	
	if (typeof finishCallback !== 'function') {
	    throw new Error('Callback has to be an function!');
	}
    var self = this;
	
	var nugetExePath = path.join(__dirname, 'bin/nuget.exe');
	var nuget = Nuget({
		nugetPath: nugetExePath,
		verbosity: 'quiet'
	});
	
	var outputDir = resolveOutputPath(self, options);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}
	
	if (options.spec) {
	    nuget.pack({
	        spec: options.spec,
	        outputDirectory: outputDir
		}).then(function () {
			var packedNupkgPath = resolveNupkgPath(options.spec, outputDir);
			if (options.print) {
				console.log("Packed: " + options.spec  + " to " + packedNupkgPath);
			}
	        finishCallback();
	    });
	}
	
	return map(function (data, callback) {
		nuget.pack({
			spec: data.nuspec,
			outputDirectory: outputDir
		}).then(function () {
			var packedNupkgPath = resolveNupkgPath(data.nuspec, outputDir);
		    data.nupkg = packedNupkgPath;
			callback(null, data);
			if (options.print) {
				console.log(data);
			}
			finishCallback(data);
		});
	});
}

Nu.prototype.addStream = function (options, callback) {
	options = options || {};
	var finishCallback = callback || function () { };
	
	if (typeof finishCallback !== 'function') {
		throw new Error('Callback has to be an function!');
	}
	
	var nugetExePath = path.join(__dirname, 'bin/nuget.exe');
	var nuget = Nuget({
		nugetPath: nugetExePath,
		verbosity: 'quiet'
	});
	
	if (options.nupkg) {
		nuget.add({
			nupkg: options.nupkg,
			source: options.source
		}).then(function () {
			if (options.print) {
				console.log("Added: " + options.nupkg + " to " + options.source);
			}
			finishCallback();
		});;
	} else {
		return map(function (data, callback) {
			nuget.add({
				nupkg: data.nupkg,
				source: options.source
			}).then(function () {
				if (options.print) {
					console.log(data);
				}
			    finishCallback();
				callback(null, data);
			});
		});
	}
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
		var outputDir = resolveOutputPath(self, options);
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