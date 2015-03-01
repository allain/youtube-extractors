var Readable = require('stream').Readable;

module.exports = {
  comments: fetchComments
};

function fetchComments(videoId) {
  var readable = new Readable();

  readable._read = function() {

  };

  return readable;
}
