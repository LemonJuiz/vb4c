var Marks = {};

Marks.bookmarks = [];

Marks.currentBookmarks = [];

var port = chrome.extension.connect({name: "main"});

Marks.parse = function(marks) {
  marks.forEach(function(bookmark) {
    if (bookmark.url) Marks.bookmarks.push(["bookmark", bookmark.title, bookmark.url]);
    if (bookmark.children) Marks.parse(bookmark.children);
  });
};

Marks.match = function(string, callback) {
  if (string.trim() === "") return callback(this.bookmarks.slice(0, 10));
  var regexp;
  var matches = [];
  for (var i = 0, l = this.bookmarks.length; i < l; ++i) {
    try {
      regexp = new RegExp(string, "i");
      if (regexp.test(this.bookmarks[i].slice(1, 3).join(" "))) {
        matches.push(this.bookmarks[i]);
      }
    } catch (e) {
      if (string === this.bookmarks[i][1].substring(0, string.length)) {
        matches.push(this.bookmarks[i]);
      }
    }
    if (matches.length > 10) break;
  }
  callback(matches);
};

port.onMessage.addListener(function(response) {
  if (response.history) {
    var matches = [];
    for (var key in response.history) {
      if (response.history[key].url) {
        if (response.history[key].title.trim() === "") {
          matches.push(["history", "Untitled", response.history[key].url]);
        } else {
          matches.push(["history", response.history[key].title, response.history[key].url]);
        }
      }
    }
    if (Command.actionType === "history") {
      if (matches.length > 0) {
        Command.appendResults(matches);
      } else Command.hideData();
    }
    Marks.history = matches;
  } else if (response.bookmarks) {
    Marks.parse(response.bookmarks);
  }
});
