var sp = require('./suppose-process')
var ss = require('./suppose-stream')

module.exports = function suppose()
{
  if(typeof arguments[0] === 'string'
  && arguments[1] instanceof Array)
    return sp.apply(null, arguments)

  return ss.apply(null, arguments)
}
