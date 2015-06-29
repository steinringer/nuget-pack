'use strict';
describe('nuget-pckg', function () {
    
    var Ng = require('../nuget-pckg.js'),
        fse = require('fs-extra'),
        fs = require('fs');
    
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

	it('should list filtered nuspec files', function(done) {
		//Arrange
        var ng = new Ng({
            baseDir: './tests',
            skip: ['proj2*.nuspec']
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
        });

    });

    it('should callback with error if all nuspec files filtered out', function(done) {
        //Arrange
        var ng = new Ng({
            baseDir: './tests',
            skip: ['proj1', 'proj2']
        });
        
        //Act
        ng.getNuspecs(function (err, res) {
            //Assert
            expect(err).toBeDefined();
	        expect(err.toString()).toBe('Error: No .nuspec files match the criteria');
	        expect(res).toBeNull();
            done();
        });

	});
    
    it('should create nuget package with specified nuspec file', function (done) {
        //Arrange
        var expectedPackage = './tests/publishFolder/Proj1.1.0.0.nupkg';
        
        var ng = new Ng({
            baseDir: './tests',
            outputPath: './tests/publishFolder',
            skip: ['proj2']
        });
        
        //Act
        ng.pack(function () {
            //Assert
	        var created = fs.existsSync(expectedPackage);
            expect(created).toBeTruthy();
            clean(expectedPackage);
            done();
        });
    });

	it('should create nuget package without outputpath specified', function(done) {
		//Arrange
        var expectedPackage = './tests/Proj1.1.0.0.nupkg';

        var ng = new Ng({
            baseDir: './tests',
            skip: ['proj2.nuspec']
        });

		//Act
        ng.pack(function () {
            //Assert
            var created = fs.existsSync(expectedPackage);
            expect(created).toBeTruthy();
            clean(expectedPackage);
            done();
        });


	});
    
    var clean = function (expectedPackage) {
        fse.removeSync(expectedPackage);
    }
});