var EventEmitter = require("events").EventEmitter;
var cheerio = require('cheerio');

module.exports = function (html, cb) {
  var parser = new CommentParser();
  parser.parse(html, function (err, parsed) {
    cb(null, {
      comments: parsed
    });
  });
};

/* Constructor */
var CommentParser = function () {
  this.pageComments = [];
  this.nextCommentID = 0;
  this.ee = new EventEmitter();
};

CommentParser.prototype.parse = function (html, callback) {
  if (!html)
    return callback(new Error("No comment code provided."));
  if (!html.length)
    return callback(new Error("No comment code provided."));

  var self = this;

  this.ee.once('done', function () {
    callback(null, self.pageComments);
    self.pageComments = [];
  });

  var $ = cheerio.load(html, {
    normalizeWhitespace: true
  });

  /* Select all comment-item divs and create a new CommentItems object from them */
  var commentItems = new CommentItems($, $("div .comment-item"));

  /* start processing the HTML */
  this.processComments(commentItems, 0);
};

/* TODO: should this be its own function? What about the pageComments array? */
CommentParser.prototype.processComments = function (commentItems, startIndex) {
  var self = this;

  if (startIndex >= commentItems.length) {
    self.ee.emit('done');
    return false;
  }

  commentItems.eachC(startIndex, function (commentItem, index) {
    /* if this comment is a reply to another comment ignore it*/
    if (commentItem.attr("class").indexOf("reply") > -1) {

      /* Critical if statement. If the last comment is a reply
       * we still need to emit 'done' or the execution stops and
       * the program terminates */
      if (index + 1 >= commentItems.length)
        self.ee.emit('done');

      return true;
    }

    self.pageComments.push(
      parseOneComment(commentItem, self.nextCommentID++, -1));

    /* If a comment has replies we have to request them from Youtube, since they are
     * hidden if there are many of them. So we stop processing these comments
     * load the replies, parse them, add them to the array and then resume processing
     * the comments */

    /* check whether this comment has replies */
    var nextElement = commentItem.next();
    if (nextElement.text().length > 1) {
      /* If the replies are hidden there is another div between the comment-item
       * and the comment replies. skip over it... */
      if (nextElement.attr('class')) {
        if (nextElement.attr('class').indexOf("comment-replies-header") > -1) {
          nextElement = nextElement.next();
        }
      }
      /* find the Youtube comment id */
      var ytCommentId = commentItem.attr('data-cid').toString();
      var myCommentId = self.pageComments[self.pageComments.length - 1].id;

      /*
       * get out of this loop (return false) to get the comment replies asynchronously.
       * when done resume from index+1
       */
      /*self.loadCommentReplies(ytCommentId, myCommentId, function (commentReplies) {
        self.pageComments.push.apply(self.pageComments, commentReplies);
        self.processComments(commentItems, index + 1);
      });*/
      //return false;
    }

    if (index + 1 >= commentItems.length) {
      self.ee.emit('done');
      return false;
    }

  });
};

var parseOneComment = function (commentItemElement, commentID, replyToID) {
  var comment = {
    id: commentID,
    replyTo: replyToID,
    numReplies: 0
  };

  /* Extract comment information */
  comment.youtubeCommentID = commentItemElement
    .attr('data-cid').toString();
  comment.user = commentItemElement
    .children(".content")
    .children("div .comment-header")
    .children(".user-name")
    .text();

  var dateYT = commentItemElement
    .children(".content")
    .children("div .comment-header")
    .children(".time")
    .text().trim();
  comment.date = convertYtDate(dateYT);
  comment.dateYT = dateYT;

  comment.commentText = commentItemElement
    .children(".content")
    .children("div .comment-text")
    .children("div .comment-text-content")
    .text();
  var likes = commentItemElement
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
