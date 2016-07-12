var gulp = require('gulp'),
	path = require('path'),
	fse = require('fs-extra'),
	Ng = require('./nuget-pckg');


var ng = new Ng({
	baseDir: path.resolve('./tests/proj1')
});



gulp.task('stream', function () {
	ng.getNuspecsStream({
		skip: ['proj2'],
		print: true
	})
	.pipe(ng.packStream({
		outputDirectory: './tests/publishFolder',
		print: true
	}))
	.pipe(ng.addStream({
		source: './tests/server',
		print: true
	}));
});

gulp.task('list', function(cb) {
    ng.getNuspecsStream({
        skip: ['proj2'],
        print: true
	}, cb);
});

gulp.task('pack', ['list'], function (cb) {
	ng.packStream({
		outputDirectory: './tests/publishFolder',
		spec: './tests/proj1/proj1.nuspec',
		print: true
	}, cb);
});

gulp.task('add', ['pack'],  function () {
	ng.addStream({
		nupkg: './tests/publishFolder/Proj1.1.0.0.nupkg',
		source: './tests/server',
		print: true
	});
});


var clean = function() {
	fse.removeSync('./tests/publishFolder');
	fse.removeSync('./tests/server');
}