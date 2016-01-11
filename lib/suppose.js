var sp = require('./suppose-process')
var ss = require('./suppose-stream')


function suppose()
{
  if(typeof arguments[0] === 'string')
    return sp.apply(null, arguments)

  return ss.apply(null, arguments)
}


suppose.process = sp
suppose.stream  = ss

module.exports = suppose
