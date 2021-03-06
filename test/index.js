var fs = require('fs');
var assert = require('chai').assert;
var stream = require('stream');
var concat = require('concat-stream');
var fetchPage = require('../lib/page-fetcher.js');
var md5 = require('MD5');

var extractors = require('..')({});

describe('youtube-extractors', function () {
  it('should implements comments extractor', function () {
    assert.isFunction(extractors.comments);

    var result = extractors.comments('Gaid72fqzNE');

    assert(result instanceof stream.Readable);
  });

  it('fetches comments', function (done) {
    this.timeout(10000);

    extractors.comments('Gaid72fqzNE').pipe(concat(function (comments) {
      assert(comments.length > 1, 'should have some comments');
      assert.equal(50, comments.length, 'until it starts iterating to other pages');
      comments.forEach(function (c) {
        assert(typeof (c.id) === 'string');
        assert(typeof (c.replyTo) === 'number');
        assert(typeof (c.numReplies) === 'number');
        assert(typeof (c.user) === 'string');
        assert(typeof (c.commentText) === 'string');
        assert(typeof (c.rawDate) === 'string');
        assert(typeof (c.timestamp) === 'number');
      });

      done();
    }));
  });
});