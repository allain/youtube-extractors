var EventEmitter = require("events").EventEmitter;
var cheerio = require('cheerio');
var moment = require('moment-natural');

module.exports = function (html, cb) {
  if (!html || !html.length)
    return cb(new Error("No comment code provided."));

  var pageComments = [];
  var nextCommentID = 0;

  var self = this;

  var $ = cheerio.load(html, {
    normalizeWhitespace: true
  });

  $("div .comment-item").each(function(index) {
    var e = $(this);

    if (!e.hasClass('reply')) {
      var comment = parseOneComment(e, -1);
      pageComments.push(comment);
    }
  });

  return cb(null, {
    comments: pageComments
  });
};

function parseOneComment(e, replyToID) {
  var rawDate = e.find('.comment-header .time').text().trim();
  return {
    id : e.attr('data-cid'),
    replyTo: replyToID,
    numReplies: 0,
    user: e.find('.content div .comment-header .user-name').text(),
    commentText: e.find('.content .comment-text-content').text(),
    likes: parseInt(e.find('.content .comment-footer-actions .like-count.on').text()) - 1,
    rawDate: rawDate,
    timestamp: moment.natural(rawDate).unix()
  };
}
