'use strict';
describe('nuget-pckg', function () {
	
	var Ng = require('../nuget-pckg.js'),
		fse = require('fs-extra'),
		fs = require('fs');
	
	describe('getNuspecs', function () {
		it('should throw if baseDir does not exist', function (done) {
			//Arrange
			var ng = new Ng({
				baseDir: './aa'
			});
			
			//Act
			ng.getNuspecs(function (err, res) {
				expect(err).toBeDefined();
				expect(err.toString()).toBe('Error: Provided baseDir does not exist');
				done();
			});
		    //Assert

		});
		
		it('should list nuspec files', function (done) {
			//Arrange
			var ng = new Ng({
				baseDir: './tests'
			});
			
			//Act
			ng.getNuspecs(function (err, res) {
				
				//Assert
				expect(res).toEqual(
					[
						__dirname + '\\proj1\\proj1.nuspec',
						__dirname + '\\proj2\\proj2.nuspec'
					]
				);
				done();
			});

		});
		
		it('should list filtered nuspec files', function (done) {
			//Arrange
			var ng = new Ng({
				baseDir: './tests'
			});
			
			//Act
			ng.getNuspecs(function (err, res) {
				//Assert
				expect(res).toEqual(
					[
						__dirname + '\\proj1\\proj1.nuspec'
					]
				);
				done();
			},
			{ skip: ['proj2*.nuspec'] });

		});
		
		it('should callback with error if all nuspec files filtered out', function (done) {
			//Arrange
			var ng = new Ng({
				baseDir: './tests'
			});
			
			//Act
			ng.getNuspecs(function (err, res) {
				//Assert
				expect(err).toBeDefined();
				expect(err.toString()).toBe('Error: No .nuspec files match the criteria');
				expect(res).toBeNull();
				done();
			},
			{ skip: ['proj1', 'proj2'] });

		});
	});
	
	describe('pack', function () {
		it('should create nuget package with specified nuspec file', function (done) {
			//Arrange
			var expectedPackage = './tests/publishFolder/Proj1.1.0.0.nupkg';
			
			var ng = new Ng({
				baseDir: './tests'
			});
			
			//Act
			ng.pack(function () {
				//Assert
				var created = fs.existsSync(expectedPackage);
				expect(created).toBeTruthy();
				done();
				clean(expectedPackage);
			},
		    {
				outputDirectory: './tests/publishFolder',
				skip: ['proj2']
			});
		});
		
		it('should create nuget package without outputpath specified', function (done) {
			//Arrange
			var expectedPackage = './tests/Proj1.1.0.0.nupkg';
			
			var ng = new Ng({
				baseDir: './tests'
			});
			
			//Act
			ng.pack(function () {
				//Assert
				var created = fs.existsSync(expectedPackage);
				expect(created).toBeTruthy();
				done();
				clean(expectedPackage);
			},
		    {
				skip: ['proj2.nuspec']
			});
		});
	});
	
	describe('add', function () {
		
		it('should add single nuget package to folder structure', function (done) {
			//Arrange
			var expectedPackage = [
				'./tests/server/proj1/1.0.0/proj1.1.0.0.nupkg',
				'./tests/server/proj1/1.0.0/proj1.1.0.0.nupkg.sha512',
				'./tests/server/proj1/1.0.0/proj1.nuspec'
			];

			var ng = new Ng({
				baseDir: './tests'
			});

		    //Act
			ng.add(function () {
				
				expectedPackage.forEach(function(e) {
					var created = fs.existsSync(e);
					expect(created).toBeTruthy();
					clean(e);
				});
				done();
		    },
		    {
				nupkg: './tests/packed/Proj1.1.0.0.nupkg',
				source: './tests/server/'
		    });

		    //Assert

		});
		
	});
	
	var clean = function (expectedPackage) {
		fse.removeSync(expectedPackage);
	}
});