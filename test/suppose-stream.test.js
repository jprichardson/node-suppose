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

    input.push('Hi')
    output.once('data', function(chunk, encoding, next)
    {
      assert.strictEqual(chunk.toString(), 'Bye')

      done()
    })
  })
})
