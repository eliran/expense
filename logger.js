var winston = require('winston')
  , bunyan = require('bunyan')
  , log = new winston.Logger({
    transports: [
        new winston.transports.Console({ colorize: true, json: false })
    ]
})

/**
 * A Bunyan raw stream object (i.e. has a `.write(rec)` method that takes a
 * Bunyan log record) that shims logging to a given Winston logger.
 *
 * @param {winston.Logger} wlog is a Winston Logger to which to shim.
 */
function Bunyan2Winston(wlog) {
    this.wlog = wlog
}

Bunyan2Winston.prototype.write = function write(rec) {
    // Map to the appropriate Winston log level (by default 'info', 'warn'
    // or 'error') and call signature: `wlog.log(level, msg, metadata)`.
    var wlevel
    if (rec.level <= bunyan.INFO) {
      wlevel = 'info'
    } else if (rec.level <= bunyan.WARN) {
      wlevel = 'warn'
    } else {
      wlevel = 'error'
    }

    // Note: We are *modifying* the log record here. This could be a problem
    // if our Bunyan logger had other streams. This one doesn't.
    var msg = rec.msg
      , res = rec.res
    delete rec.msg

    // Remove internal bunyan fields that won't mean anything outside of
    // a bunyan context.
    delete rec.v
    delete rec.level

    rec.time = String(rec.time)
    delete rec.res
    if ( res ) {
      sanitizePassword(res.req.body)
      this.wlog.log(wlevel, '%s [%s] %s %s [%s] => %s %s | %s', rec.time, msg, res.req.method, res.req.url , JSON.stringify(res.req.body) , res.statusCode, res.statusMessage, res._data)
    }
}

function sanitizePassword(object){
  if ( typeof object === 'object' ) {
    removeKeyValue(object, 'password')
    removeKeyValue(object, 'confirm')
    Object.keys(object).forEach(function(key){
      if ( typeof object[key] === 'object' ) sanitizePassword(object[key])
    })
  }
}

function removeKeyValue(object, key){
  if ( key in object ) object[key] = '[--removed--]'
}

module.exports = {
  defaultLogger: bunyan.createLogger({
    name: 'myapp'
  , streams: [ {
      type: 'raw'
    , level: 'trace'
    , stream: new Bunyan2Winston(log)
    } ]
  })
}
