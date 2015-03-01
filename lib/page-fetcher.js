var assert = require('assert');
var xhrc = require("xmlhttprequest-cookie");
var XMLHttpRequest = xhrc.XMLHttpRequest;
var CookieJar = xhrc.CookieJar;

var getSessionToken = require('./build-session.js');

/*
 * IMPORTANT:
 * Youtube expects a session token AND a Cookie with each ajax request. The regular
 * XMLHttpRequest does not send cookies, so I used the xmlhttprequest-cookie module.
 * Not sure what exactly that Cookie contains and there is no authentication needed to
 * get it. It is just added to the repsonse when requesting the comment website
 * (YT_COMMENTS_URL).
 */

var YT_COMMENTS_URL = "https://www.youtube.com/all_comments?v=";
var YT_AJAX_URL = "https://www.youtube.com/comment_ajax?action_load_comments=1&order_by_time=True&filter=";
var YT_AJAX_REPLY_URL = "https://www.youtube.com/comment_ajax?action_load_replies=1&order_by_time=True&tab=inbox";

var sessionToken;
var lastSessionToken;

module.exports = function (videoID, pageToken, cb) {
  getSessionToken(videoID, function (err, sessionToken) {
    if (err) return cb(err);

    if (sessionToken && lastSessionToken) {
      assert.equal(sessionToken, lastSessionToken);
    }
    lastSessionToken = sessionToken;

    var params;
    if (pageToken) {
      params = {
        session_token: sessionToken,
        page_token: pageToken
      };
    } else {
      params = {
        session_token: sessionToken,
        video_id: videoID
      };
    }

    xhrPost(YT_AJAX_URL + videoID, params, processResponse);
  });

  function processResponse(err, result) {
    if (err) return cb(err);

    if (result.status != 200) {
      return cb(new Error('Requesting comment page failed. Status ' + result.status));
    }

    if (!result.responseText)
      return cb(new Error('No comments received from server. Status ' + result.status));

    try {
      var json = JSON.parse(fixEscapeSequences(result.responseText.toString()));
      cb(null, {
        html: json.html,
        pageToken: json.page_token
      });
    } catch (e) {
      cb(new Error('Error parsing Server response: ' + e));
    }
  }
};

/*
 * Sometimes Youtube uses '\U' which should be '\u'. So try to replace any invalid
 * escape sequences with their lowercase versions first.
 */
function fixEscapeSequences(str) {
  return str.replace(/(\\[^"\/bfnrtu\\])/, function (match) {
    return match.toLowerCase();
  });
}

function xhrPost(url, params, callback) {
  var xhr = new xhrc.XMLHttpRequest();
  xhr.debug = false;

  xhr.open("POST", url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      callback(null, xhr);
    }
  };

  var requestBody;
  if (params) {
    var bodyParam = [];
    for (var name in params) {
      bodyParam.push(name + '=' + encodeURIComponent(params[name]));
    }

    requestBody = bodyParam.join('&');
    if (requestBody) {
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    }
  }

  xhr.send(requestBody);
}