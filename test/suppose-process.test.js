var assert = require('assert')
  , testutil = require('testutil')
  , suppose = require('../lib/suppose')
  , path = require('path')
  , fs = require('fs-extra')
  , P = require('autoresolve')
  , S = require('string')
  , readline = require('readline');

var TEST_DIR = ''

describe('+ suppose', function(){
  beforeEach(function(){
    TEST_DIR = testutil.createTestDir('suppose')
  })

  describe('process', function() {
    it('should automate the command: npm init', function(done) {
      process.chdir(TEST_DIR);
      suppose('npm', ['init'])
        .on(/name\: \([\w|\-]+\)[\s]*/).respond("awesome_package\n")
        //.on('name: (suppose-test) ').respond('awesome_package\n')
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
        var packageFile = path.join(TEST_DIR, 'package.json');
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
        })
      })
    })

    it('should automate the command: npm init and output stdio', function(done) {
      var debugFile = path.join(TEST_DIR, 'debug.txt');
      process.chdir(TEST_DIR);
      suppose('npm', ['init'])
        .debug(fs.createWriteStream(debugFile))
        .on(/name\: \([\w|\-]+\)[\s]*/).respond("awesome_package\n")
        //.on('name: (suppose-test) ').respond('awesome_package\n')
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
        var packageFile = path.join(TEST_DIR, 'package.json');
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
          
          //check debug file
          var debugString = fs.readFileSync(debugFile).toString();
          var checkString = fs.readFileSync(P('test/resources/debug.txt')).toString();
          assert(debugString === checkString);
          done()
        })
      })
    })

    it('should call the error method if there is an error', function(done) {
      var someErr = null;

      function onError(err) {
        someErr = err;
      }

      process.chdir(TEST_DIR);
      suppose('node', ['this_script_does_not_exist.js'])
      .error(onError)
      .end(function(code) {
        assert(someErr);
        assert(S(someErr.message).startsWith('Error: Cannot find module'))
        done()
      })
    })
  })
})

