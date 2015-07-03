var testutil = require('testutil')
  , suppose = require('../lib/suppose')
  , path = require('path')
  , fs = require('fs-extra')
  , P = require('autoresolve')
  , S = require('string')
  , readline = require('readline')
  , os = require('os')

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
          EQ (packageObj.name, 'awesome_package')
          EQ (packageObj.version, '0.0.1')
          EQ (packageObj.description, "It's an awesome package man!")
          EQ (packageObj.main, 'index.js')
          EQ (packageObj.scripts.test, 'npm test')
          EQ (packageObj.keywords[0], 'awesome')
          EQ (packageObj.keywords[1], 'cool')
          EQ (packageObj.author, 'JP Richardson')
          EQ (packageObj.license, 'MIT')
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
        EQ (code, 0);
        var packageFile = path.join(TEST_DIR, 'package.json');
        fs.readFile(packageFile, function(err, data){
          var packageObj = JSON.parse(data.toString());
          EQ (packageObj.name, 'awesome_package')
          EQ (packageObj.version, '0.0.1')
          EQ (packageObj.description, "It's an awesome package man!")
          EQ (packageObj.main, 'index.js')
          EQ (packageObj.scripts.test, 'npm test')
          EQ (packageObj.keywords[0], 'awesome')
          EQ (packageObj.keywords[1], 'cool')
          EQ (packageObj.author, 'JP Richardson')
          EQ (packageObj.license, 'MIT')

          var debugResFile = ''
          if (os.platform() === 'darwin')
            debugResFile = P('test/resources/debug-darwin.txt')
          else
            debugResFile = P('test/resources/debug-linux.txt')

          //check debug file
          var debugString = fs.readFileSync(debugFile).toString();
          var checkString = fs.readFileSync(debugResFile).toString();
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

    it('should call a method as response', function(done) {
      var pid = null

      process.chdir(TEST_DIR);
      suppose('ls', ['-l'])
      .on(/total \d+\s*/).respond(function(exe)
      {
        pid = exe.pid
      })
      .end(function(code) {
        EQ (code, 0);
        T (pid);
        done()
      })
    })
  })
})
