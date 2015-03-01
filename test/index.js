var expect = require('chai').expect,
    youtubeExtractors = require('..');

describe('youtube-extractors', function() {
  it('should say hello', function(done) {
    expect(youtubeExtractors()).to.equal('Hello, world');
    done();
  });
});
