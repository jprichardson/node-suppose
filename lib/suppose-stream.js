//THIS DOESN'T WORK YET. DON'T USE IT

var stream = require('stream')
  , S = require('string')
  , util = require('util');


function Suppose(readable, writable) {
    throw new Error('Suppose Stream does not work yet.')
    this.readable = readable;
    this.writable = writable;
    this.expects = [];
    this.responses = [];
    this.debugWriteStream = null;
    this.errorCallback = function(err) { throw err }; //default errorCallback
    this.endCallback = function(){};

    /*if (!readable.readable || !writable.writable) {
        throw new Error('Readable stream is not "readable" or Writable stream is not "writable"');
    }*/

    var self = this;

    var readBuffer = '', needNew = false, expect = '', response = '', match = false;
    this.readable.on('data', function(data) {
        console.log('DATA')
        if (self.debugWriteStream) {
            self.debugWriteStream.write(data);
        }

        readBuffer += data.toString(); //TODO: empty readBuffer somewhere
        if (needNew) {
            expect = self.expects.shift();
            response = self.responses.shift();
            needNew = false;
        }

        if (typeof expect === 'string')
            match = S(readBuffer).endsWith(expect)
        else if (typeof expect === 'object')
            match = (readBuffer.match(expect) != null);

        console.log('MATCH: ' + match)
        if (match) {
            needNew = true;
            self.writable.write(response);
            match = false;

            if (self.debugWriteStream) {
                self.debugWriteStream.write(response, 'utf8')
            }
        }
    });

    this.readable.on('end', function() {
        self.endCallback();
    });
}

Suppose.prototype.debug = function(stream) {
    this.debugWriteStream = stream;
    return this;
}

Suppose.prototype.error = function(errorCallback) {
    this.errorCallback = errorCallback;
    return this;
}

Suppose.prototype.on = function(expect) {
    this.expects.push(expect);
    return this;
}

Suppose.prototype.respond = function(response) {
    this.responses.push(response);
    return this;
}

Suppose.prototype.end = function(callback){
    this.endCallback = callback;
    return this;
}



module.exports = function suppose(readable, writable) {
    return new Suppose(readable, writable);
}

