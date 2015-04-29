'use strict';
describe('nuget-pack', function () {
    
    var Ng = require('../nuget-pack.js');

	it('should throw if baseDir does not exist', function(done) {
		//Arrange
        var ng = Ng({
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
	    var ng = Ng({
            baseDir: './tests'
        });
	    
        //Act
	    ng.getNuspecs(function(err, res) {

		    expect(res).toEqual(
			    [
				    __dirname + '\\proj1\\proj1.nuspec',
				    __dirname + '\\proj2\\proj2.nuspec'
			    ]
		    );
		    done();
	    });

	    //Assert
        

    });

	it('should create nuget package with specified nuspec file', function(done) {
		//Arrange
		var ng = Ng({
            baseDir: './tests',
            
        });

		//Act
		ng.getNuspecs(function(err, res) {
            console.log(res);
			done();
		});

		//Assert

	});

});