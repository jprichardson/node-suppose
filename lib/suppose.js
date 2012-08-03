var spawn = require('child_process').spawn
  , S = require('string');

var Suppose = (function() {
    var self = null;

    function Suppose(cmd, args) {
        self = this;
        this.cmd = cmd;
        this.args = args;
        this.expects = [];
        this.responses = [];
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
        var exe = spawn(this.cmd, this.args, {cwd: process.cwd(), env: process.env});
        var needNew = true, buffer = '', needNew = true;
        var expect = '', response = '';

        exe.stdout.on('data', function(data){
            buffer += data.toString();

            if (needNew) {
                expect = self.expects.shift();
                response = self.responses.shift();
                needNew = false;
            }

            /*console.log("DATA: " + data.toString());
            console.log("EXPECT: " + expect)*/
            if (S(buffer).endsWith(expect)){
                //console.log('MATCH')
                needNew = true;
                exe.stdin.write(response);
            }
        });
        exe.on('exit', function(code){
            callback(code);
        });
    }

    return Suppose;
})();

module.exports = function suppose(cmd, args) {
    return new Suppose(cmd, args);
}