var test = require('tape').test
var join = require('path').join
var os = require('os')

var fs = require('fs-extra')
var P = require('autoresolve')
var testutil = require('testutil')

var SupposeProcess = require('../').Process

function before (next) {
  return function (t) {
    t.context = { TEST_DIR: testutil.createTestDir('suppose') }
    fs.writeFile(join(t.context.TEST_DIR, 'README.md'), 'READ IT', function (err) {
      t.ifError(err)
      next(t)
    })
  }
}

test('should automate the command: npm init', before(function (t) {
  process.chdir(t.context.TEST_DIR)

  new SupposeProcess('npm', ['init'])
    .when(/name\: \((\w|\-)+\)\s*/).respond('awesome_package\n')
    .when('version: (1.0.0) ').respond('0.0.1\n')
    .when('description: ').respond('It\'s an awesome package man!\n')
    .when('entry point: (index.js) ').respond('\n')
    .when('test command: ').respond('npm test\n')
    .when('git repository: ').respond('\n')
    .when('keywords: ').respond('awesome, cool\n')
    .when('author: ').respond('JP Richardson\n')
    .when('license: (ISC) ').respond('MIT\n')
    .when('ok? (yes) ').respond('yes\n')
  .on('error', function (err) { t.fail(err) })
  .end(function (code) {
    t.same(code, 0)

    var packageObj = require(join(t.context.TEST_DIR, 'package.json'))
    t.same(packageObj.name, 'awesome_package')
    t.same(packageObj.version, '0.0.1')
    t.same(packageObj.description, 'It\'s an awesome package man!')
    t.same(packageObj.main, 'index.js')
    t.same(packageObj.scripts.test, 'npm test')
    t.same(packageObj.keywords[0], 'awesome')
    t.same(packageObj.keywords[1], 'cool')
    t.same(packageObj.author, 'JP Richardson')
    t.same(packageObj.license, 'MIT')

    t.end()
  })
}))

test('should automate the command: npm init and output stdio', before(function (t) {
  var debugFile = join(t.context.TEST_DIR, 'debug.txt')
  process.chdir(t.context.TEST_DIR)

  new SupposeProcess('npm', ['init'], { debug: fs.createWriteStream(debugFile) })
    .when(/name\: \([\w|\-]+\)[\s]*/).respond('awesome_package\n')
    .when('version: (1.0.0) ').respond('0.0.1\n')
    .when('description: ').respond("It's an awesome package man!\n")
    .when('entry point: (index.js) ').respond('\n')
    .when('test command: ').respond('npm test\n')
    .when('git repository: ').respond('\n')
    .when('keywords: ').respond('awesome, cool\n')
    .when('author: ').respond('JP Richardson\n')
    .when('license: (ISC) ').respond('MIT\n')
    .when('ok? (yes) ').respond('yes\n')
  .on('error', function (err) { t.fail(err) })
  .end(function (code, signal) {
    t.same(code, 0)

    var packageObj = require(join(t.context.TEST_DIR, 'package.json'))
    t.same(packageObj.name, 'awesome_package')
    t.same(packageObj.version, '0.0.1')
    t.same(packageObj.description, "It's an awesome package man!")
    t.same(packageObj.main, 'index.js')
    t.same(packageObj.scripts.test, 'npm test')
    t.same(packageObj.keywords[0], 'awesome')
    t.same(packageObj.keywords[1], 'cool')
    t.same(packageObj.author, 'JP Richardson')
    t.same(packageObj.license, 'MIT')

    var debugResFile = os.platform() === 'darwin'
      ? P('test/resources/debug-darwin.txt')
      : P('test/resources/debug-linux.txt')

    // check debug file
    var debugString = fs.readFileSync(debugFile).toString()
    var checkString = fs.readFileSync(debugResFile).toString()

    t.same(debugString, checkString)

    t.end()
  })
}))

test('should emit the error event if there is an error', before(function (t) {
  process.chdir(t.context.TEST_DIR)

  t.plan(3)
  new SupposeProcess('node', [ 'this_script_does_not_exist.js' ])
    .on('error', function (err) {
      t.ok(err.toString().match(/Error: Cannot find module/))
    })
    .end(function (code) {
      t.notSame(code, 0)
    })
}))

test('should call a method as response', before(function (t) {
  process.chdir(t.context.TEST_DIR)

  t.plan(5)
  new SupposeProcess('ls', [ '-l' ])
    .when(/total (\d+)\s*/).respond(function (exe, num) {
      t.notSame(exe, undefined)
      t.notSame(exe.pid, undefined)
      t.notOk(isNaN(num))
    })
    .end(function (code) {
      t.same(code, 0)
    })
}))

test('should end if no expectations and no output', before(function (t) {
  new SupposeProcess('cat')
    .end(function (code) {
      t.same(code, 0)
      t.end()
    })
}))
