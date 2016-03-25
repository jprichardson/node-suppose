var EventEmitter = require('events')
var spawn = require('child_process').spawn
var inherits = require('inherits')

var SupposeStream = require('./stream')

function SupposeProcess (command, args, options) {
  EventEmitter.call(this)

  if (!Array.isArray(args)) {
    options = args
    args = undefined
  }

  this._command = command
  this._args = args || []
  this._options = options || {}

  this._debug = this._options.debug
  if (this._debug === true) this._debug = process.stderr

  this._supposeStream = new SupposeStream(this._debug)
  this._supposeStream.on('error', this.emit.bind(this, 'error'))

  this._exe = null
}

inherits(SupposeProcess, EventEmitter)

SupposeProcess.prototype.when = function (expect, response) {
  this._supposeStream.when(expect, response)
  return this
}

SupposeProcess.prototype.respond = function (response) {
  if (typeof response === 'function') {
    var self = this
    var _response = response
    response = function () {
      var args = [].slice.call(arguments)
      args.unshift(self._exe)
      _response.apply(self, args)
    }
  }

  this._supposeStream.respond(response)
  return this
}

SupposeProcess.prototype.end = function (callback) {
  this._exe = spawn(this._command, this._args, this._options)

  if (this._debug) {
    var cmdString = this._command + ' ' + this._args.join(' ') + '\n'
    this._debug.write(cmdString, 'utf8')
    for (var i = 0; i < cmdString.length; ++i) this._debug.write('-')
    this._debug.write('\n')
  }

  // Empty write signals SupposeStream that input has started and .when()
  // will not be called again so it can end output early where possible.
  this._supposeStream.write('')

  this._exe.stdout.pipe(this._supposeStream).pipe(this._exe.stdin)

  var self = this
  this._exe.stderr.on('data', function (data) {
    self.emit('error', new Error(data.toString()))
  })

  this._exe.on('exit', callback.bind(this))

  return this._exe
}

module.exports = SupposeProcess
