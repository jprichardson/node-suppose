var sp = require('./suppose-process')
  , ss = require('./suppose-stream')
  , stream = require('stream').Stream
  , net = require('net');

module.exports = function suppose() {
  if (arguments.length === 2) {
    if (typeof arguments[0] === 'string' && arguments[1] instanceof Array)
        return sp.apply(null, arguments);
    else
        return ss.apply(null, arguments);
  } else {
    return ss.apply(null, arguments);
  }
}