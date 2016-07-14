var gulp = require('gulp'),
	path = require('path'),
	fse = require('fs-extra'),
	Ng = require('./nuget-pckg');


var ng = new Ng({
	baseDir: path.resolve('./tests')
});

// EXAMPLE: call the methods as streams
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

// EXAMPLE: call the gulp tasks as prerequisities with done callbacks for correct order
gulp.task('list', function(done) {
    ng.getNuspecs({
		log: true,
		skip: ['server', 'publishFolder']
	}, done);
});

gulp.task('pack', ['list'], function (done) {
	ng.pack({
		outputDirectory: './tests/publishFolder',
		spec: './tests/proj1/proj1.nuspec',
		log: true
	}, done);
});

gulp.task('add', ['pack'],  function (done) {
	ng.add({
		nupkg: './tests/publishFolder/Proj1.1.0.0.nupkg',
		source: './tests/server',
		log: true
	}, done);
});

gulp.task('clean', function() {
    clean();
});


var clean = function() {
	fse.removeSync('./tests/publishFolder');
	fse.removeSync('./tests/server');
}