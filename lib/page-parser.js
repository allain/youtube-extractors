var EventEmitter = require("events").EventEmitter;
var cheerio = require('cheerio');

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
  var comment = {
    replyTo: replyToID,
    numReplies: 0
  };

  /* Extract comment information */
  comment.id = e.attr('data-cid').toString();
  comment.user = e.children(".content")
    .children("div .comment-header")
    .children(".user-name")
    .text();

  var dateYT = e 
    .children(".content")
    .children("div .comment-header")
    .children(".time")
    .text().trim();
  comment.date = convertYtDate(dateYT);
  comment.dateYT = dateYT;

  comment.commentText = e 
    .children(".content")
    .children("div .comment-text")
    .children("div .comment-text-content")
    .text();
  var likes = e 
    .children(".content")
    .children("div .comment-footer")
    .children("div .comment-footer-actions")
    .children(".like-count.on").text();
  comment.likes = parseInt(likes) - 1;

  return comment;
}

/* CommentItems Class */
var CommentItems = function ($, o) {
  this.$ = $
  for (var key in o)
    this[key] = o[key];
};
CommentItems.prototype.eachC = function (startIndex, func) {
  for (var i = startIndex; i < this.length; i++) {
    if (func(this.$(this[i]), i) === false)
      break;
  }
};

function convertYtDate(ytDate) {
  var re = /(\d+)\s(\w+)\sago/;
  var m = re.exec(ytDate);

  if (m.length <= 1)
    return null;

  var num = parseInt(m[1]);
  var type = m[2];

  var date = new Date();

  if (type === "minute" || type === "minutes") {
    date.setMinutes(date.getMinutes() - num);
  } else if (type === "day" || type === "days") {
    date.setDate(date.getDate() - num);
  } else if (type === "week" || type === "weeks") {
    date.setDate(date.getDate() - (num * 7));
  } else if (type === "month" || type === "months") {
    date.setMonth(date.getMonth() - num);
  } else if (type === "year" || type === "years") {
    date.setFullYear(date.getFullYear() - num);
  }

  return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}
