var forceArray = require('force-array')
var S          = require('string')
var stream     = require('stream')
var strip      = require('strip-ansi')
var util       = require('util')


function SupposeStream(options) {
  if(!(this instanceof SupposeStream)) return new SupposeStream(options)

  SupposeStream.super_.call(this)


  var debug
  var stripAnsi
  if(options)
  {
    debug = (options instanceof stream.Writable) ? options : options.debug
    if(options.stripAnsi) stripAnsi = strip
  }

  this.expects = []

  var readBuffer = ''
  var needNew = true
  var sentEof = false

  var condition
  var responses

  this._transform = function(chunk, encoding, callback)
  {
    if(debug) debug.write(chunk)

    readBuffer += chunk.toString()
    if(needNew)
    {
      var expect = this.expects.shift()

      condition = expect && expect.condition
      responses = expect && expect.responses

      if(!expect && !sentEof)
      {
        // this.expects was always empty
        this.push(null)
        sentEof = true
      }

      needNew = false
    }

    const buffer = stripAnsi ? stripAnsi(readBuffer) : readBuffer

    var match
    switch(typeof condition)
    {
      case 'string':
        match = S(buffer).endsWith(condition)
      break

      case 'object':
        match = buffer.match(condition)
    }

    if(match)
    {
      match = (match instanceof Array) ? match.slice(1) : []

      readBuffer = ''
      needNew = true

      responses.forEach(function(response)
      {
        if(response instanceof Function)
          response.apply(this, match)
        else
        {
          this.push(response)

          if(debug) debug.write(response, 'utf8')
        }
      }, this)

      if(!this.expects.length)
      {
        this.push(null)
        sentEof = true
      }
    }

    callback()
  }
}
util.inherits(SupposeStream, stream.Transform)


SupposeStream.prototype.when = function(condition, response) {
  var expect =
  {
    condition: condition,
    responses: forceArray(response)
  }

  this.expects.push(expect)

  return this
}

SupposeStream.prototype.respond = function(response) {
  var expects = this.expects
  var expect = expects[expects.length-1]

  expect.responses = expect.responses.concat(response)

  return this
}


module.exports = SupposeStream
