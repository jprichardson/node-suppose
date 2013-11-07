var spawn = require('child_process').spawn
  , S = require('string')
  , util = require('util')

function Suppose(cmd, args) {
  this.cmd = cmd
  this.args = args
  this.expects = []
  this.responses = []
  this.writeStream = null
  this.errorCallback = function(err) { throw err } //default errorCallback
}

Suppose.prototype.debug = function(stream) {
  this.writeStream = stream
  return this
}

Suppose.prototype.error = function(errorCallback) {
  this.errorCallback = errorCallback
  return this
}

Suppose.prototype.on = function(expect) {
  this.expects.push(expect)
  return this
}

Suppose.prototype.respond = function(response) {
  this.responses.push(response)
  return this
}

Suppose.prototype.end = function(callback){
  var exe = spawn(this.cmd, this.args, {cwd: process.cwd(), env: process.env, detached: false})
  var needNew = true, buffer = '', match = false
  var expect = '', response = ''
  var self = this

  if (self.writeStream) {
    var cmdString = util.format("%s %s", this.cmd, this.args.join(' ')) + "\n"
    self.writeStream.write(cmdString, 'utf8')
    self.writeStream.write(S('-').times(cmdString.length) + "\n")
  }

  exe.stdout.on('data', function(data){
    buffer += data.toString()
    if (self.writeStream) {
      self.writeStream.write(data)
    }

    if (needNew) {
      expect = self.expects.shift()
      response = self.responses.shift()
      needNew = false
    }

    if (typeof expect === 'string')
      match = S(buffer).endsWith(expect)
    else if (typeof expect === 'object')
      match = (buffer.match(expect) != null)

    if (match) {
      needNew = true
      exe.stdin.write(response)
      match = false

      if (self.writeStream) {
        self.writeStream.write(response, 'utf8')
      }
    
      if (self.expects.length === 0 && self.responses.length === 0) {
        exe.stdin.end()
      }
    }
  })

  exe.stderr.on('data', function(data) {
    //console.log(data.toString().red)
    self.errorCallback(new Error(data.toString()))
  })

  exe.on('close', function(code) {
    //console.log('CLOSE'.red)
  })

  exe.on('exit', function(code){
    //console.log('EXIT'.red)
    callback(code)
  })
  
  return exe;
}


module.exports = function suppose(cmd, args) {
  return new Suppose(cmd, args)
}

