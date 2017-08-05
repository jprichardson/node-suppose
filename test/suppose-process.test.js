var assert    = require('assert')
var join      = require('path').join
var os        = require('os')
var readline  = require('readline')

var fs        = require('fs-extra')
var isWindows = require('is-windows')()
var stripAnsi = require('strip-ansi')
var testutil  = require('testutil')

var suppose   = require('../lib/suppose')

var it_posixOnly   = isWindows ? it.skip : it;
var it_windowsOnly = isWindows ? it : it.skip;


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

  it('should automate a prompt script', function(done)
  {
    var self = this

    process.chdir(this.TEST_DIR)

    suppose('node', [`${__dirname}/helpers/cli-prompt.js`], {stripAnsi: true})
      .when('name (mocked name)').respond('awesome_package\n')
      .when('version (1.0.0)').respond('0.0.1\n')
    .on('error', done)
    .end(function(code)
    {
      assert.strictEqual(code, 0)

      var packageObj = require(join(self.TEST_DIR, 'temp.json'))

      assert.strictEqual(packageObj.name, 'awesome_package')
      assert.strictEqual(packageObj.version, '0.0.1')

      done()
    })
  })

  it('should automate a prompt script and output stdio', function(done)
  {
    var self = this

    var debugFile = join(this.TEST_DIR, 'debug.txt')
    process.chdir(this.TEST_DIR)

    var options = {debug: fs.createWriteStream(debugFile), stripAnsi: true}

    suppose('node', [`${__dirname}/helpers/cli-prompt.js`], options)
      .when('name (mocked name)').respond('awesome_package\n')
      .when('version (1.0.0)').respond('0.0.1\n')
    .end(function(code, signal)
    {
      assert.strictEqual(code, 0)

      var packageObj = require(join(self.TEST_DIR, 'temp.json'))

      assert.strictEqual(packageObj.name, 'awesome_package')
      assert.strictEqual(packageObj.version, '0.0.1')

      var debugResFile = ''
      if (os.platform() === 'darwin')
        debugResFile = `${__dirname}/fixtures/debug-darwin.txt`
      else
        debugResFile = `${__dirname}/fixtures/debug-linux.txt`

      //check debug file
      var debugString = fs.readFileSync(debugFile).toString()
                          .replace(/\r\n|\r|\n/g, '\n')
      var checkString = fs.readFileSync(debugResFile).toString()
                          .replace(/\r\n|\r|\n/g, '\n')

      //remove first two lines as they contain platform-specific paths
      debugString = debugString.split('\n').slice(2).join('\n')
      checkString = checkString.split('\n').slice(2).join('\n')

      //ensure that output contained ansi escape codes (colors)
      assert.notStrictEqual(debugString, stripAnsi(debugString))
      assert.notStrictEqual(checkString, stripAnsi(checkString))

      //strip colors because they oddly appeared at inconsistent indexes
      assert.strictEqual(stripAnsi(debugString), stripAnsi(checkString))

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

  it_posixOnly('should call a method as response', function(done)
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

  it_posixOnly('should end if no expectations and no output', function(done)
  {
    suppose('cat')
    .end(function(code)
    {
      assert.strictEqual(code, 0)

      done()
    })
  })
})
