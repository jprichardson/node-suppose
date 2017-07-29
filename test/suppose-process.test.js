var assert   = require('assert')
var join     = require('path').join
var os       = require('os')
var readline = require('readline')


var fs       = require('fs-extra')
var testutil = require('testutil')

var suppose = require('../lib/suppose')


beforeEach(function(done)
{
  this.TEST_DIR = testutil.createTestDir('suppose')
  fs.writeFile(join(this.TEST_DIR, 'README.md'), 'READ IT', done)
})

describe('process', function()
{
  it('must be a TTY', function(done)
  {
    suppose('node')
      .when(/> /).respond('Boolean(process.stdin.isTTY)\n')
      .when(/true/).respond('Boolean(process.stdout.isTTY)\n')
      .when(/true/)
      .end(function(code)
      {
        assert.strictEqual(code, 0)

        done()
      })
  })

  it('should automate the command: npm init', function(done)
  {
    var self = this

    process.chdir(this.TEST_DIR)

    suppose('npm', ['init'])
      .when(/name\: \((\w|\-)+\)\s*/).respond("awesome_package\n")
      //.when(/name: \(test-suppose\) /).respond('awesome_package\n')
      .when(/version: \(1\.0\.0\) /).respond('0.0.1\n')
      .when(/description: /).respond("It's an awesome package man!\n")
      .when(/entry point: \(index\.js\) /).respond("\n")
      .when(/test command: /).respond('npm test\n')
      .when(/git repository: /).respond("\n")
      .when(/keywords: /).respond('awesome, cool\n')
      .when(/author: /).respond('JP Richardson\n')
      .when(/license: \(ISC\) /).respond('MIT\n')
      .when(/ok\? \(yes\) / ).respond('yes\n')
    .on('error', done)
    .end(function(code)
    {
      assert.strictEqual(code, 0)

      var packageObj = require(join(self.TEST_DIR, 'package.json'))

      assert.strictEqual(packageObj.name, 'awesome_package')
      assert.strictEqual(packageObj.version, '0.0.1')
      assert.strictEqual(packageObj.description, "It's an awesome package man!")
      assert.strictEqual(packageObj.main, 'index.js')
      assert.strictEqual(packageObj.scripts.test, 'npm test')
      assert.strictEqual(packageObj.keywords[0], 'awesome')
      assert.strictEqual(packageObj.keywords[1], 'cool')
      assert.strictEqual(packageObj.author, 'JP Richardson')
      assert.strictEqual(packageObj.license, 'MIT')

      done()
    })
  })

  it('should automate the command: npm init and output stdio', function(done)
  {
    var self = this

    var debugFile = join(this.TEST_DIR, 'debug.txt')
    process.chdir(this.TEST_DIR)

    suppose('npm', ['init'], {debug: fs.createWriteStream(debugFile)})
      .when(/name\: \((\w|\-)+\)\s*/).respond("awesome_package\n")
      //.when(/name: \(test-suppose\) /).respond('awesome_package\n')
      .when(/version: \(1\.0\.0\) /).respond('0.0.1\n')
      .when(/description: /).respond("It's an awesome package man!\n")
      .when(/entry point: \(index\.js\) /).respond("\n")
      .when(/test command: /).respond('npm test\n')
      .when(/git repository: /).respond("\n")
      .when(/keywords: /).respond('awesome, cool\n')
      .when(/author: /).respond('JP Richardson\n')
      .when(/license: \(ISC\) /).respond('MIT\n')
      .when(/ok\? \(yes\) / ).respond('yes\n')
    .end(function(code, signal)
    {
      assert.strictEqual(code, 0)

      var packageObj = require(join(self.TEST_DIR, 'package.json'))

      assert.strictEqual(packageObj.name, 'awesome_package')
      assert.strictEqual(packageObj.version, '0.0.1')
      assert.strictEqual(packageObj.description, "It's an awesome package man!")
      assert.strictEqual(packageObj.main, 'index.js')
      assert.strictEqual(packageObj.scripts.test, 'npm test')
      assert.strictEqual(packageObj.keywords[0], 'awesome')
      assert.strictEqual(packageObj.keywords[1], 'cool')
      assert.strictEqual(packageObj.author, 'JP Richardson')
      assert.strictEqual(packageObj.license, 'MIT')

      var debugResFile = ''
      if (os.platform() === 'darwin')
        debugResFile = `${__dirname}/test/resources/debug-darwin.txt`
      else
        debugResFile = `${__dirname}/test/resources/debug-linux.txt`

      //check debug file
      var debugString = fs.readFileSync(debugFile).toString()
                          .replace(/\r\n|\r|\n/g, '\n')
      var checkString = fs.readFileSync(debugResFile).toString()
                          .replace(/\r\n|\r|\n/g, '\n')

      assert.strictEqual(debugString, checkString)

      done()
    })
  })

  xit('should emit the error event if there is an error', function(done)
  {
    process.chdir(this.TEST_DIR)

    suppose('not_exist')
    .on('error',function(err)
    {
      assert.notStrictEqual(err, undefined)
      assert.ok(err.message.includes('Error: Cannot find module'))
    })
    .end(function(code)
    {
      assert.notStrictEqual(code, 0)

      done()
    })
  })

  it('should call a method as response', function(done)
  {
    process.chdir(this.TEST_DIR)

    suppose('ls', ['-l'])
    .when(/total (\d+)\s*/).respond(function(exe, num)
    {
      assert.notStrictEqual(exe, undefined)
      assert.notStrictEqual(exe.pid, undefined)

      assert.ok(!isNaN(num))
    })
    .end(function(code)
    {
      assert.strictEqual(code, 0)

      done()
    })
  })

  it('should end if no expectations and no output', function(done)
  {
    suppose('cat')
    .end(function(code)
    {
      assert.strictEqual(code, 0)

      done()
    })
  })
})
