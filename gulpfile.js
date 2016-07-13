var gulp = require('gulp'),
	path = require('path'),
	fse = require('fs-extra'),
	Ng = require('./nuget-pckg');


var ng = new Ng({
	baseDir: path.resolve('./tests')
});

gulp.task('stream', function (done) {
	ng.getNuspecs({
		skip: ['server', 'publishFolder']
	})
	.pipe(ng.pack({
		outputDirectory: './tests/publishFolder',
		log: true
	}))
	.pipe(ng.add({
		source: './tests/server',
		log: true
	})).on('end', done);
});

gulp.task('list', function(cb) {
    ng.getNuspecs({
		log: true,
		skip: ['server', 'publishFolder']
	}, cb);
});

gulp.task('pack', ['list'], function (cb) {
	ng.pack({
		outputDirectory: './tests/publishFolder',
		spec: './tests/proj1/proj1.nuspec',
		log: true
	}, cb);
});

gulp.task('add', ['pack'],  function (cb) {
	ng.add({
		nupkg: './tests/publishFolder/Proj1.1.0.0.nupkg',
		source: './tests/server',
		log: true
	}, cb);
});

gulp.task('clean', function() {
    clean();
});


var clean = function() {
	fse.removeSync('./tests/publishFolder');
	fse.removeSync('./tests/server');
}