[![build status](https://secure.travis-ci.org/jprichardson/node-suppose.png)](http://travis-ci.org/jprichardson/node-suppose)


Node.js - suppose
=================

Have you ever heard of the command line program [expect][1]? Basically, `expect`
allows you to automate command line programs. `suppose` is a programmable
Node.js module that allows the same behavior.


Why?
----

From the [expect wikipedia][1] page, you can see many examples of `expect`
scripts automating tasks such as `telnet` or `ftp` sessions. Now you can easily
write Node.js scripts to do the same. This may be most beneficial during testing.


Installation
------------

```sh
npm install suppose
```


Example
------

Automate the command `npm init`, which initializes a new npm module.

```javascript
var suppose = require('suppose')
  , fs = require('fs')
  , assert = require('assert')

process.chdir('/tmp/awesome');
fs.writeFileSync('/tmp/awesome/README.md', 'READ IT')
// debug is an optional writeable output stream
suppose('npm', ['init'], {debug: fs.createWriteStream('/tmp/debug.txt')})
  .when(/name\: \([\w|\-]+\)[\s]*/).respond('awesome_package\n')
  .when('version: (1.0.0) ').respond('0.0.1\n')
  // response can also be the second argument to .when
  .when('description: ', "It's an awesome package man!\n")
  .when('entry point: (index.js) ').respond("\n")
  .when('test command: ').respond('npm test\n')
  .when('git repository: ').respond("\n")
  .when('keywords: ').respond('awesome, cool\n')
  .when('author: ').respond('JP Richardson\n')
  .when('license: (ISC) ').respond('MIT\n')
  .when('ok? (yes) ' ).respond('yes\n')
.on('error', function(err){
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

`.respond()` may be called any number of times after `.when()`.  Each response
will be sent in the order defined when the condition matches.  Once all
conditions and responses are defined, call `.end()` to begin execution.


Contributors
------------

* [Philipp Staender](https://github.com/pstaender)
* [Jesús Leganés Combarro 'piranna'](https://github.com/piranna)


License
-------

(MIT License)

Copyright 2012-2013, JP Richardson



[1]: http://en.wikipedia.org/wiki/Expect


[aboutjp]: http://about.me/jprichardson
[twitter]: http://twitter.com/jprichardson
[procbits]: http://procbits.com
[gitpilot]: http://gitpilot.com
