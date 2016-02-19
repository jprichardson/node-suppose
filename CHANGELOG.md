0.4.0 / 2016-01-11
------------------
* *Breaking* `suppose()` arguments have changed.  It can be called as
  `suppose(command[, args][, options])` to suppose against process input/output
  or `suppose([options])` to suppose as a `stream` that receives input and
  outputs responses.
* *Breaking* Use `.when()` instead of `.on()` for expectations.
* *Breaking* Use `.on('error')` instead of `.error()` for error handling.
* *Breaking* Use `debug` option instead of `.debug()` to provide a stream
  which receives debugging output.

0.3.1 / 2015-11-05
------------------
* Support callback function as response (piranna  / #8)
* Support response as optional argument to `.on()`

0.3.0 / 2013-11-07
------------------
* `.end()` now returns internal process object. (pstaender  / #5)

0.2.0 / 2013-05-01
------------------
* fixed but to make Node v0.10 compatible
* dropped Node v0.6 suppport

0.1.0 / 2013-01-22
------------------
* Updated deps.
* Changed identing from 4 spaces to 2.
* Updated tests for modern `npm`.

0.0.7 / 2012-09-06
------------------
* Added Travis-CI support.

0.0.6 / 2012-08-09
------------------
* Added `error` method.

0.0.5 / 2012-08-08
------------------
* `debug` method now logs the command at the top of write stream.

0.0.4 / 2012-08-07
------------------
* Added `debug` method to output stdio to writeable stream.

0.0.3 / 2012-08-06
------------------
* Supports matching regular expressions now.

0.0.2 / 2012-08-03
------------------
* Fixed self/this class level variable bug.

0.0.1 / 2012-08-03
------------------
* Initial release.