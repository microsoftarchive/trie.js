(function (T) {

  'use strict';

  function importer (index) {
    return function(json) {
      return [index,json];
    };
  }

  function exporter (index) {
    return function() {
      return {index:index};
    };
  }

  T.porter = {
    'importer': importer,
    'exporter': exporter
  };

}).call(null, T);