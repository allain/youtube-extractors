var assert = require('chai').assert;
var stream = require('stream');
var concat = require('concat-stream');

var session = require('../lib/build-session');

describe('build-session', function () {
  it('should retain the session_token across calls', function (done) {
    this.timeout(10000);
    session('Gaid72fqzNE', function (err, token1) {
      session('Gaid72fqzNE', function (err, token2) {
        assert.equal(token1, token2);
        done();
      });
    });
  });
});