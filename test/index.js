var assert = require('chai').assert;
var stream = require('stream');
var concat = require('concat-stream');

var extractors = require('..');

describe('youtube-extractors', function () {
  it('should implements comments extractor', function () {
    assert.isFunction(extractors.comments);

    var result = extractors.comments('Gaid72fqzNE');

    assert(result instanceof stream.Readable);
  });

  it('fetches comments', function (done) {
    this.timeout(10000);

    extractors.comments('Gaid72fqzNE').pipe(concat(function (array) {
      assert(array.length > 1, 'should have some comments');
      assert.equal(50, array.length, 'until it starts iterating to other pages');
      done();
    }));
  });
});