var assert = require('chai').assert;
var extractors = require('..');
var stream = require('stream');

describe('youtube-extractors', function() {
  it('should implements comments extractor', function() {
    assert.isFunction(extractors.comments);
    var result = extractors.comments('Gaid72fqzNE');
    assert(result instanceof stream.Readable);
  });
});
