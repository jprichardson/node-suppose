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
    fs.writeFileSync(path.join(TEST_DIR, 'README.md'), 'READ IT')
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
      .error(function (err) {
        done(err)
      })
      .end(function(code){
        EQ (code, 0)
        var packageFile = path.join(TEST_DIR, 'package.json');
        fs.readFile(packageFile, function(err, data){
          var packageObj = JSON.parse(data.toString());
          T (packageObj.name === 'awesome_package')
          T (packageObj.version === '0.0.1')
          T (packageObj.description === "It's an awesome package man!")
          T (packageObj.main === 'index.js')
          T (packageObj.scripts.test === 'npm test')
          T (packageObj.keywords[0] === 'awesome')
          T (packageObj.keywords[1] === 'cool')
          T (packageObj.author === 'JP Richardson')
          T (packageObj.license === 'MIT')
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
          T (packageObj.name === 'awesome_package')
          T (packageObj.version === '0.0.1')
          T (packageObj.description === "It's an awesome package man!")
          T (packageObj.main === 'index.js')
          T (packageObj.scripts.test === 'npm test')
          T (packageObj.keywords[0] === 'awesome')
          T (packageObj.keywords[1] === 'cool')
          T (packageObj.author === 'JP Richardson')
          T (packageObj.license === 'MIT')
          
          //check debug file
          var debugString = fs.readFileSync(debugFile).toString();
          var checkString = fs.readFileSync(P('test/resources/debug.txt')).toString();
          EQ (debugString, checkString)
          done()
        })
      })
    })

    it('should call the error method if there is an error', function(done) {
      var someErr = null

      process.chdir(TEST_DIR);
      suppose('node', ['this_script_does_not_exist.js'])
      .error(function(err) {
        someErr = err
      })
      .end(function(code) {
        T (code !== 0)
        T (someErr);
        T (S(someErr.message).startsWith('Error: Cannot find module'))
        done()
      })
    })
  })
})

