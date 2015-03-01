var Readable = require('stream').Readable;

var fetchPage = require('./lib/page-fetcher.js');
var parsePage = require('./lib/page-parser.js');

module.exports = {
  comments: fetchComments
};

function fetchComments(videoID) {
  var readable = new Readable({
    objectMode: true
  });

  var comments;

  fetchPage(videoID, null, function (err, result) {
    if (err) {
      readable.emit('error', err);
      return;
    }

    parsePage(result.html, function (err, result) {
      if (err) {
        readable.emit('error', err);
        return;
      }

      if (result.comments) {
        comments = comments || [];
        result.comments.forEach(function (comment) {
          comments.push(comment);
        });

        readable.push(comments.shift());
      }
    });

  });

  readable._read = function () {
    if (comments === void 0) return;
    if (comments.length) {
      this.push(comments.shift());
    } else {
      this.push(null);
    }
  };

  return readable;
}