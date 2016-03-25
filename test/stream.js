var test = require('tape').test
var PassThrough = require('stream').PassThrough

var SupposeStream = require('../').Stream

function unexpectedOutput (chunk) {
  throw new Error('Unexpected output: ' + chunk)
}

test('should respond to a stream', function (t) {
  var input = new PassThrough()
  var output = new PassThrough()

  input.pipe(new SupposeStream())
    .when('Hi').respond('Bye')
    .pipe(output)

  t.plan(1)
  output.once('data', function (chunk, encoding, next) {
    t.same(chunk.toString(), 'Bye')
    output.once('data', unexpectedOutput)
  })
  output.once('error', function (err) { t.fail(err) })
  output.once('end', t.end.bind(t))

  input.push('Hi')
  input.push('Unexpected')
})

test('should end if no expectations', function (t) {
  var suppose = new SupposeStream()

  t.plan(0)
  suppose.once('data', unexpectedOutput)
  suppose.once('error', function (err) { t.fail(err) })
  suppose.once('end', t.end.bind(t))

  suppose.write('Hi')
  // stream should end without end of input
})
