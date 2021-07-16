'use strict';
var fs = require('fs'),
	Nuget = require('nuget-runner'),
	path = require('path'),
	find = require('find'),
	map = require('map-stream'),
	xml2json = require('simple-xml2json'),
	Readable = require('stream').Readable;


function Nu() {}

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

var resolveNupkgPath = function(nuspecPath, outputDir) {
	var nuspecFileContents = fs.readFileSync(nuspecPath);
	var json = xml2json.parser(nuspecFileContents.toString());
	var id = json.package.metadata.id;
	var version = json.package.metadata.version;
	var packedNupkgPath = path.join(outputDir, id + "." + version + ".nupkg");
    return packedNupkgPath;
}

var getInstance = function() {
	var nugetExePath = path.join(__dirname, 'bin/nuget.exe');
	var nuget = Nuget({
		nugetPath: nugetExePath,
		verbosity: 'quiet'
	});
    return nuget;
}

var checkCallback = function () {
	//you should not provide callback when the method is used in stream mode.
    if (arguments[0] && arguments[0][0] && (!arguments[0][0].spec && !arguments[0][0].nupkg)) {
        if (arguments[0][1] && typeof arguments[0][1] === "function") {
			console.warn("You should not provide callback function if method is used in stream mode. Hook to .on('end', fn) event instead!");
        }
    }
}

Nu.prototype.getNuspecs = function (options, finishCallback) {
	options = options || {};
	options.baseDir = options.baseDir || '.';

	finishCallback = finishCallback || function () { };
	
	var rs = new Readable({ objectMode: true });
	
	var files = find.fileSync(/\w\.nuspec$/, options.baseDir);
	
	var filtered = files.filter(function (nuspecFile) {
		return !shouldSkip(options, nuspecFile);
	});

	filtered.forEach(function (nuspecFile) {
		rs.push(nuspecFile);
		if (options.log) {
			console.log(nuspecFile);
		}
	});
	
	rs.push(null);
	finishCallback();
	return rs;
}

Nu.prototype.pack = function (options, finishCallback) {
    checkCallback(arguments);
	options = options || {};
	finishCallback = finishCallback || function () { };
    var nuget = getInstance();
	
    var outputDir = options.outputDirectory;
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
	return map(function (nuspecFile, callback) {
		nuget.pack({
			spec: nuspecFile,
			outputDirectory: outputDir
		}).then(function () {
			var packedNupkgPath = resolveNupkgPath(nuspecFile, outputDir);
			log(nuspecFile, packedNupkgPath);
		    callback(null, packedNupkgPath);
		});
	});
}

Nu.prototype.add = function (options, finishCallback) {
	checkCallback(arguments);
	options = options || {};
	finishCallback = finishCallback || function () { };
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
		});
	} else {
		return map(function (data, callback) {
			nuget.add({
				nupkg: data,
				source: options.source
			}).then(function () {
			    log(data);
				callback(null, data);
			});
		});
	}
}

Nu.prototype.push = function (options, finishCallback) {
	checkCallback(arguments);
	options = options || {};
	finishCallback = finishCallback || function () { };
	var nuget = getInstance();

	var log = function(nupkg) {
		if (options.log) {
			console.log("Pushed: " + nupkg + " to " + options.source);
		} 
	}
	
	if (options.nupkg) {
		nuget.push({
			nupkg: options.nupkg,
			source: options.source,
			apiKey: options.apiKey
		}).then(() => {
			log(options.nupkg);
			finishCallback();
		});
	} else {
		return map((data, callback) => {
			nuget.push(data, {
				source: options.source,
				apiKey: options.apiKey
			})
			.then(() => {
				log(data);
				callback(null, data);
			});
		});
	}
}

module.exports = new Nu;