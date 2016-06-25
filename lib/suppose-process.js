var EventEmitter = require('events')
var S            = require('string')
var spawn        = require('child_process').spawn
var util         = require('util')

var SupposeStream = require('./suppose-stream')


function SupposeProcess(command, args, options)
{
  if(!(this instanceof SupposeProcess))
    return new SupposeProcess(command, args, options)


  var self = this


  if(args && !(args instanceof Array))
  {
    options = args
    args = undefined
  }

  args = args || []

  options = options || {}
  var debug = options.debug

  if(debug === true) debug = process.stderr

  const supposeStreamOptions =
  {
    debug: debug,
    stripAnsi: options.stripAnsi
  }
  var supposeStream = SupposeStream(supposeStreamOptions)
  var exe

  supposeStream.on('error', this.emit.bind(this, 'error'))

  Object.defineProperty(this, 'expects',
  {
    get: function(){return supposeStream.expects}
  })


  this.when = function(expect, response)
  {
    supposeStream.when(expect)

    if(response) this.respond(response)

    return this
  }

  this.respond = function(response)
  {
    if(response instanceof Function)
      supposeStream.respond(function()
      {
        var argv = Array.prototype.slice.call(arguments)
        argv.unshift(exe)

        response.apply(self, argv)
      })
    else
      supposeStream.respond(response)

    return this
  }


  this.end = function(callback)
  {
    exe = spawn(command, args, options)

    if(debug)
    {
      var cmdString = util.format('%s %s', command, args.join(' ')) + '\n'

      debug.write(cmdString, 'utf8')
      debug.write(S('-').times(cmdString.length) + '\n')
    }

    // Empty write signals SupposeStream that input has started and .when()
    // will not be called again so it can end output early where possible.
    supposeStream.write('')

    exe.stdout.pipe(supposeStream).pipe(exe.stdin)

    exe.stderr.on('data', function(data)
    {
      self.emit('error', new Error(data.toString()))
    })

    exe.on('exit', callback.bind(this))

    return exe
  }
}
util.inherits(SupposeProcess, EventEmitter)


module.exports = SupposeProcess
