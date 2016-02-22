var forceArray = require('force-array')
var S          = require('string')
var Transform  = require('stream').Transform
var util       = require('util')


function SupposeStream(debug) {
  if(!(this instanceof SupposeStream)) return new SupposeStream(debug)

  SupposeStream.super_.call(this)


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

    var match
    switch(typeof condition)
    {
      case 'string':
        match = S(readBuffer).endsWith(condition)
      break

      case 'object':
        match = readBuffer.match(condition) != null
    }

    if(match)
    {
      readBuffer = ''
      needNew = true

      responses.forEach(function(response)
      {
        if(response instanceof Function)
          response.call(this)
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
util.inherits(SupposeStream, Transform)


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
