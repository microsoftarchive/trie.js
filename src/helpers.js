(function(T, undefined) {

  'use strict';

  // From https://gist.github.com/jed/982883
  var template = "10000000-1000-4000-8000-100000000000";
  function uuid(seg) {
    if(seg) {
      return ( seg ^ Math.random() * 16 >> seg/4 ).toString(16);
    } else {
      return template.replace(/[018]/g, uuid);
    }
  }

  T.helpers = {
    'uuid': uuid
  };

}).call(null, T);