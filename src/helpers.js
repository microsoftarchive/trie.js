(function (T) {

  'use strict';

  // From https://gist.github.com/jed/982883
  var template = "10000000-1000-4000-8000-100000000000";
  function uuid (seg) {
    if(seg) {
      return ( seg ^ Math.random() * 16 >> seg/4 ).toString(16);
    } else {
      return template.replace(/[018]/g, uuid);
    }
  }

  // Array Test
  function isArray (obj) {
    return (obj instanceof Array);
  }

  // String Test
  var toString = Object.prototype.toString;
  function isString (obj) {
    // TODO: jsperf this vs typeof check
    return (toString.call(obj) === '[object String]');
  }

  T.helpers = {
    'isArray': isArray,
    'isString': isString,
    'uuid': uuid
  };

}).call(null, T);
