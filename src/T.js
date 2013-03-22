(function (global) {

  'use strict';

  var T = {};
  var window = global;

  // Node.JS
  if (typeof module !== 'undefined') {
    module.exports = T;
  }
  // AMD loader like require.js
  else if (typeof window.define === "function" && define.amd) {
    define("trie", function () {
      return T;
    });
  }
  // Export as global
  else {
    window.T = T;
  }

//{{MODULES_GO_HERE}}

}).call(null, this);
