/* global describe, it */
var assert = require('assert')
var PassThrough = require('stream').PassThrough

var SupposeStream = require('../lib/suppose-stream')

describe('stream', function () {
  it('should respond to a stream', function (done) {
    var input = new PassThrough()
    var output = new PassThrough()

    input.pipe(SupposeStream())
      .when('Hi').respond('Bye')
      .pipe(output)

    output.once('data', function (chunk, encoding, next) {
      assert.strictEqual(chunk.toString(), 'Bye')

      output.once('data', function (chunk, encoding, next) {
        throw new Error('Unexpected output: ' + chunk)
      })
    })
    output.once('error', done)
    output.once('end', done)

    input.push('Hi')
    input.push('Unexpected')
  })

  it('should end if no expectations', function (done) {
    var suppose = new SupposeStream()

    suppose.once('data', function (chunk, encoding, next) {
      throw new Error('Unexpected output: ' + chunk)
    })
    suppose.once('error', done)
    suppose.once('end', done)

    suppose.write('Hi')
    // stream should end without end of input
  })
})
