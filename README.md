# youtube-extractors

Extracts information from youtube videos as node.js streams.

Based on the excellent work by [Philip Klostermann](https://github.com/philbot9/Youtube-Comment-Scraper).

[![build status](https://secure.travis-ci.org/allain/youtube-extractors.png)](http://travis-ci.org/allain/youtube-extractors)

## Installation

This module is installed via npm:

``` bash
$ npm install youtube-extractors
```

## Example Usage

``` js
var stdout = require('stdout');
var extractors = require('youtube-extractors')();

// To extract comments
extractors.comments('videoID').pipe(stdout());

// To extract comment replies
extractors.commentReplis('videoID').pipe(stdout());
```
