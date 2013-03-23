(function (T, undefined) {

  'use strict';

  T.indexer = function indexer (index, subStringIndexingEnabled) {

    // Let each Index have it's own indexer
    return function (id, text, weight) {

      // No text, No Index
      if (text === undefined) {
        return;
      }

      // Default weight for a doc is 1
      weight = weight || 1;

      // Tokenize
      var tokens = index._tokenize(text) || [];

      // For each token, find a node in the trie
      // & push a reference to the doc there
      tokens.forEach(function (token) { //, i) {

        // var reference = {
        //   'id': id
        //   // TODO: use position/distances for better ranking
        //   // ,'position': i
        //   // TODO: use weight
        // };

        // Split chars & create a regular trie for prefix search
        var node = index._resolve(token, true);
        node[';'] = node[';'] || [];
        node[';'].push(id); // push reference instead

        // Also insert suffixes with length > 2 in the trie, for partial match
        if (subStringIndexingEnabled && token.length > 2) {
          for(var j = 1, l = token.length - 1; j < l; j++) {
            node = index._resolve(token.substr(j), true);
            node[';'] = node[';'] || [];
            node[';'].push(id); // push reference instead
          }
        }
      });
    };
  };

}).call(null, T);
