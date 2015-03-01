var assert = require('assert');
var xhrc = require("xmlhttprequest-cookie");
var XMLHttpRequest = xhrc.XMLHttpRequest;
var CookieJar = xhrc.CookieJar;
var YT_COMMENTS_URL = "https://www.youtube.com/all_comments?v=";

var sessionToken;

module.exports = getSessionToken;

function getSessionToken(videoID, cb) {
  if (sessionToken) return cb(null, sessionToken);

  assert(!sessionToken);

  var xhr = new XMLHttpRequest();
  xhr.debug = false;

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status !== 200)
        return cb(new Error("Unable to retrieve video page. Status " + xhr.status));

      var re = /\'XSRF_TOKEN\'\s*\n*:\s*\n*"(.*)"/;
      var match = re.exec(xhr.responseText);

      if (!match || match.length <= 1)
        return cb(new Error("Unable to find session token"));

      if (CookieJar.cookieList.length === 0)
        return cb(new Error("No cookie received"));

      sessionToken = match[1];

      cb(null, sessionToken);
    }
  };

  xhr.open("GET", "https://www.youtube.com/all_comments?v=" + videoID);
  xhr.send();
}