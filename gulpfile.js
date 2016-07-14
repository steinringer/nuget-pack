var gulp = require('gulp'),
	path = require('path'),
	fse = require('fs-extra'),
	Ng = require('./nuget-pckg');

// EXAMPLE: call the methods as streams
gulp.task('stream', function (done) {
	Ng.getNuspecs({
		skip: ['server', 'publishFolder'],
		baseDir: path.resolve('./tests')
	})
	.pipe(Ng.pack({
		outputDirectory: './tests/publishFolder',
		log: true
	}))
	.pipe(Ng.add({
		source: './tests/server',
		log: true
	})).on('end', done);
});

// EXAMPLE: call the gulp tasks as prerequisities with done callbacks for correct order
gulp.task('list', function(done) {
    Ng.getNuspecs({
		log: true,
		skip: ['server', 'publishFolder'],
		baseDir: path.resolve('./tests')
	}, done);
});

gulp.task('pack', ['list'], function (done) {
	Ng.pack({
		outputDirectory: './tests/publishFolder',
		spec: './tests/proj1/proj1.nuspec',
		log: true
	}, done);
});

gulp.task('add', ['pack'],  function (done) {
	Ng.add({
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
