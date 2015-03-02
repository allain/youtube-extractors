var EventEmitter = require("events").EventEmitter;
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = function (html, cb) {
  if (!html || !html.length)
    return cb(new Error("No comment code provided."));

  var pageComments = [];
  var nextCommentID = 0;

  var self = this;

  var $ = cheerio.load(html, {
    normalizeWhitespace: true
  });

  $("div .comment-item").each(function (index) {
    var e = $(this);

    if (!e.hasClass('reply')) {
      var rawDate = e.find('.comment-header .time').text().trim();
      var timestamp = parseTimeAgo(rawDate);

      pageComments.push({
        id: e.attr('data-cid'),
        replyTo: -1,
        numReplies: 0,
        user: e.find('.content .comment-header .user-name').text(),
        commentText: e.find('.content .comment-text-content').text(),
        likes: parseInt(e.find('.content .comment-footer-actions .like-count.on').text()) - 1,
        rawDate: rawDate,
        timestamp: timestamp
      });
    }
  });

  return cb(null, {
    comments: pageComments
  });
};

function parseTimeAgo(timeAgo) {
  var match = /^(\d+) ([a-z]+) ago/g.exec(timeAgo);
  if (!match) return null;

  return moment().add(Number(match[1]), match[2]).unix();
}