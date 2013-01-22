
Node.js - suppose
=================

Have you ever heard of the command line program [expect][1]? Basically, `expect` allows you to automate command line programs. `suppose` is a programmable Node.js module that allows the same behavior.



Why?
----

From the [expect wikipedia][1] page, you can see many examples of `expect` scripts automating tasks such as `telnet` or `ftp` sessions. Now you can easily write Node.js scripts to do the same. This may be most beneficial during testing.



Installation
------------

    npm install suppose



Example
------

Automate the command `npm init`, which initializes a new npm module.

```javascript
var suppose = require('suppose')
  , fs = require('fs')
  , assert = require('assert')

process.chdir('/tmp/awesome');
fs.writeFileSync('/tmp/awesome/README.md', 'READ IT')
suppose('npm', ['init'])
  .debug(fs.createWriteStream('/tmp/debug.txt')) //optional writeable output stream
  .on(/name\: \([\w|\-]+\)[\s]*/).respond('awesome_package\n')
  .on('version: (0.0.0) ').respond('0.0.1\n')
  .on('description: ').respond("It's an awesome package man!\n")
  .on('entry point: (index.js) ').respond("\n")
  .on('test command: ').respond('npm test\n')
  .on('git repository: ').respond("\n")
  .on('keywords: ').respond('awesome, cool\n')
  .on('author: ').respond('JP Richardson\n')
  .on('license: (BSD) ').respond('MIT\n')
  .on('ok? (yes) ' ).respond('yes\n')
.error(function(err){
  console.log(err.message);
})
.end(function(code){
  var packageFile = '/tmp/awesome/package.json';
  fs.readFile(packageFile, function(err, data){
    var packageObj = JSON.parse(data.toString());
    console.log(packageObj.name); //'awesome_package'
  })
})
```

Always follow an `.on()` with a `.respond()` and then finish with a `.end()`.



Author
------

`node-suppose` was written by [JP Richardson][aboutjp]. You should follow him on Twitter [@jprichardson][twitter]. Also read his coding blog [Procbits][procbits]. If you write software with others, you should checkout [Gitpilot][gitpilot] to make collaboration with Git simple.



License
-------

(MIT License)

Copyright 2012, JP Richardson



[1]: http://en.wikipedia.org/wiki/Expect


[aboutjp]: http://about.me/jprichardson
[twitter]: http://twitter.com/jprichardson
[procbits]: http://procbits.com
[gitpilot]: http://gitpilot.com

