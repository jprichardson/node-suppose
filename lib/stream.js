var Transform = require('stream').Transform
var inherits = require('inherits')

function SupposeStream (debug) {
  Transform.call(this)

  this._debug = debug

  this._expects = []
  this._condition = null
  this._responses = null
  this._text = ''
  this._needNew = true
  this._sentEOF = false
}

inherits(SupposeStream, Transform)

SupposeStream.prototype._transform = function (chunk, encoding, callback) {
  if (this._debug) this._debug.write(chunk)

  this._text += chunk.toString()
  if (this._needNew) {
    var expect = this._expects.shift()
    this._condition = expect && expect.condition
    this._responses = expect && expect.responses

    if (!expect && !this._sentEOF) {
      // this.expects was always empty
      this.push(null)
      this._sentEOF = true
    }

    this._needNew = false
  }

  var match
  if (typeof this._condition === 'string') {
    match = this._text.slice(-this._condition.length) === this._condition
  } else if (this._condition instanceof RegExp) {
    match = this._text.match(this._condition)
  }

  if (match) {
    match = Array.isArray(match) ? match.slice(1) : []

    this._text = ''
    this._needNew = true

    this._responses.forEach(function (response) {
      if (typeof response === 'function') {
        response.apply(this, match)
      } else {
        this.push(response)
        if (this._debug) this._debug.write(response, 'utf8')
      }
    }, this)

    if (this._expects.length === 0) {
      this.push(null)
      this._sentEOF = true
    }
  }

  callback()
}

SupposeStream.prototype.when = function (condition, response) {
  this._expects.push({ condition: condition, responses: [] })
  if (response) this.respond(response)
  return this
}

SupposeStream.prototype.respond = function (responses) {
  var expect = this._expects[this._expects.length - 1]
  expect.responses = expect.responses.concat(responses)
  return this
}

module.exports = SupposeStream
