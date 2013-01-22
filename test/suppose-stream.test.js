//not in use yet

var assert = require('assert')
  , suppose = require('../lib/suppose')
  , path = require('path-extra')
  , fs = require('fs-extra')
  , P = require('autoresolve')
  , S = require('string')
  , readline = require('readline')
  , Stream = require('stream').Stream
  , util = require('util')
  , net = require('net');

var TEST_DIR = path.join(path.tempdir(), 'test-suppose');



/*function PassthroughStream() {
  this.writable = true;
  this.readable = true;
}
util.inherits(PassthroughStream, Stream);

PassthroughStream.prototype.write = function(data) {
  console.log('derrta')
  this.emit('data', data);
};

PassthroughStream.prototype.end = function() {
  console.log('END PS')
  this.emit('end');
};

PassthroughStream.prototype.destroy = function() {
  this.emit('close');
};*/

//util.inherits(process.stdout, Stream);


describe.skip('+ suppose', function(){
    beforeEach(function(done){
        fs.exists(TEST_DIR, function(itDoes){
            if (itDoes) {
                fs.remove(TEST_DIR, function(err){
                    fs.mkdir(TEST_DIR, done);
                });
            } else {
                fs.mkdir(TEST_DIR, done);
            }
        });
    });

    describe('stream', function() {
        it('should respond to a stream', function(done) {
            done();
            return;
            //var socket = new net.Socket();
            //socket.connect(path.join(TEST_DIR, 'stream.sock'));

            var server = net.createServer(path.join(TEST_DIR, 'stream.sock'), function(sock) {
                console.log('HI')
                var client = net.connect(path.join(TEST_DIR, 'stream.sock'));
                process.chdir(TEST_DIR);
                var debugFile = path.join(TEST_DIR, 'debug.txt');
                suppose(client, sock)
                  .on('What is your name? ').respond('JP\n')
                .end(function(){
                   //nothing happens here since process.stdio doesn't terminate until the process is terminated
                });

                var rl = readline.createInterface({
                    input: sock,
                    output: client
                });

                rl.question("What is your name? ", function(answer) {
                    console.log(answer)
                    assert(answer === 'BOB');
                    rl.close();
                    done();
                });
            });

            

            
        });
    })

});

