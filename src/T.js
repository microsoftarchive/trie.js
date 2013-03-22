(function (global) {

  'use strict';

  var T = {};

  // Node.JS
  if (typeof module !== 'undefined') {
    module.exports = T;
  }
  // AMD loader like require.js
  else if (typeof define === "function" && define.amd) {
    define("trie", function () {
      return T;
    });
  }
  // Export as global
  else {
    global.T = T;
  }

//{{MODULES_GO_HERE}}

}).call(null, this);
