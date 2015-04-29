'use strict';
var fs = require('fs'),
    Nuget = require('nuget-runner'),
    path = require('path'),
    find = require('find');

var Nu = function (options) {
    this.options = options;
}

Nu.prototype.getNuspecs = function (callback) {
    var dir = this.options.baseDir;
    if (!fs.existsSync(dir))
        return callback(new Error('Provided baseDir does not exist'), null);
    
    if (!path.isAbsolute(this.options.baseDir)) {
        dir = path.join(__dirname, this.options.baseDir);
    }
    
    find.file(/\w\.nuspec$/, dir, function (files) {
        if (callback && typeof callback === 'function') {
            callback(null, files);
        } else {
            throw new Error('You have to provide callback function.');
        }
		
    });

};

Nu.prototype.pack = function(callback) {
    this.getNuspecs(function (err, res) {

	});
}

module.exports = function (options) {
    
    var nugetPath = './bin/nuget.exe';
    var nuget = Nuget({
        nugetPath: nugetPath
    });
    
    var nu = new Nu(options);
    return {
        pack: nuget.pack,
        getNuspecs: function(callback) {
	        return nu.getNuspecs(callback);
        }
    }
}