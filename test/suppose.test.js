var assert = require('assert')
  , suppose = require('../lib/suppose')
  , path = require('path-extra')
  , fs = require('fs-extra');

describe('suppose', function(){
    it('should automate the command: npm init', function(done){
        var currentPath = path.join(path.tempdir(), 'suppose-test');

        fs.exists(currentPath, function(itDoes){
            function startItUp(){
                fs.mkdir(currentPath, function(err){
                    assert(!err);
                    runIt();
                });
            }

            if (!itDoes) {
                startItUp();
            } else {
                fs.remove(currentPath, function(err){
                    assert(!err);
                    startItUp();
                });
            }
        });

        function runIt() {
            process.chdir(currentPath);
            suppose('npm', ['init'])
              //.on(/^name\: \([\w]+\)[\s]*/).respond("awesome_package\r")
              .on('name: (suppose-test) ').respond('awesome_package\n')
              .on('version: (0.0.0) ').respond('0.0.1\n')
              .on('description: ').respond("It's an awesome package man!\n")
              .on('entry point: (index.js) ').respond("\n")
              .on('test command: ').respond('npm test\n')
              .on('git repository: ').respond("\n")
              .on('keywords: ').respond('awesome, cool\n')
              .on('author: ').respond('JP Richardson\n')
              .on('license: (BSD) ').respond('MIT\n')
              .on('ok? (yes) ' ).respond('yes\n')
            .end(function(code){
                assert(code === 0);
                var packageFile = path.join(currentPath, 'package.json');
                fs.readFile(packageFile, function(err, data){
                    var packageObj = JSON.parse(data.toString());
                    assert(packageObj.name === 'awesome_package');
                    assert(packageObj.version === '0.0.1');
                    assert(packageObj.description === "It's an awesome package man!");
                    assert(packageObj.main === 'index.js');
                    assert(packageObj.scripts.test === 'npm test');
                    assert(packageObj.keywords[0] === 'awesome');
                    assert(packageObj.keywords[1] === 'cool');
                    assert(packageObj.author === 'JP Richardson');
                    assert(packageObj.license === 'MIT');
                    done();
                });
            });
        }
    });
});