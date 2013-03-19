(function(T, undefined) {

  'use strict';

  T.indexer = function indexer(index) {

    // Let each Index have it's own indexer
    return function (id, text) {

      // No text, No Index
      if (text === undefined) {
        return;
      }

      // Tokenize
      var tokens = index._tokenize(text) || [];

      // For each token, find a node in the trie
      // & push a reference to the doc there
      tokens.forEach(function (token, i) {

        var reference = {
          'id': id,
          // TODO: use position/distances for better ranking
          'position': i
        };

        // Split chars & create a regular trie for prefix search
        var node = index._resolve(token, true);
        node.refs = node.refs || [];
        node.refs.push(reference);

        // Also insert suffixes with length > 3 in the trie, for partial match
        // TODO: re-evaluate this for better performace & smaller object size
        if (token.length > 3) {
          for(var j = 1, l = token.length - 2; j < l; j++) {
            node = index._resolve(token.substr(j), true);
            node.refs = node.refs || [];
            node.refs.push(reference);
          }
        }
      });
    };
  };

}).call(null, T);
