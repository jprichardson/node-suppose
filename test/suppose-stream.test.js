var assert = require('assert')
var net    = require('net')
var path   = require('path')
var PassThrough = require('stream').PassThrough
var util   = require('util')

var fs = require('fs-extra')
var P = require('autoresolve')
var S = require('string')

var SupposeStream = require('../lib/suppose-stream')


describe('stream', function()
{
  it('should respond to a stream', function(done)
  {
    var input  = new PassThrough()
    var output = new PassThrough()

    input.pipe(SupposeStream())
      .when('Hi').respond('Bye')
    .pipe(output)

    output.once('data', function(chunk, encoding, next)
    {
      assert.strictEqual(chunk.toString(), 'Bye')

      output.once('data', function(chunk, encoding, next)
      {
        throw new Error('Unexpected output: ' + chunk);
      })
    })
    output.once('error', done)
    output.once('end', done)

    input.push('Hi')
    input.push('Unexpected')
  })

  it('should strip ANSI codes', function(done)
  {
    var input  = new PassThrough()
    var output = new PassThrough()

    input.pipe(SupposeStream({stripAnsi: true}))
      .when('Hi').respond('Bye')
    .pipe(output)

    output.once('data', function(chunk, encoding, next)
    {
      assert.strictEqual(chunk.toString(), 'Bye')
    })
    output.once('error', done)
    output.once('end', done)

    input.push('\u001b[4mHi\u001b[0m')
  })

  it('should strip ANSI codes splitted in several chunks', function(done)
  {
    var input  = new PassThrough()
    var output = new PassThrough()

    input.pipe(SupposeStream({stripAnsi: true}))
      .when('I have ANSI').respond('Bye')
    .pipe(output)

    output.once('data', function(chunk, encoding, next)
    {
      assert.strictEqual(chunk.toString(), 'Bye')
    })
    output.once('error', done)
    output.once('end', done)

    'I \u001b[4mhave\u001b[0m ANSI'.split('').forEach(input.push.bind(input))
  })

  it('should end if no expectations', function(done)
  {
    var suppose = new SupposeStream()

    suppose.once('data', function(chunk, encoding, next)
    {
      throw new Error('Unexpected output: ' + chunk);
    })
    suppose.once('error', done)
    suppose.once('end', done)

    suppose.write('Hi')
    // stream should end without end of input
  })
})
