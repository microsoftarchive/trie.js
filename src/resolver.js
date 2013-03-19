/**
 * This module resolves a location in the trie-structure
 * where a new token should be added when indexing
 * or when looking up
 */
(function(T, undefined) {

  'use strict';

  T.resolver = function resolver (index) {
    // Let each Index have it's own resolver
    return function(token, isForIndexing) {

      // Start resolving from the top
      var node = index._trie;

      // Split the token to individual characters
      var chars = token.split('');

      // dive into the Trie-structure, use `some` to break out of the loop
      chars.some(function(chr) {

        // Skip blanks, whitespaces, quotes, dots, dashes, or underscores
        // TODO: add a config variable to select what chars to reject here
        if(/[\s\'\"\.\-_]+/.test(chr)) {
          return;
        }

        // If the character doesn't exist in the trie
        if(node[chr] === undefined) {
          // & we are indexing
          if(isForIndexing) {
            // Then create a node
            node[chr] = {};
          } else {
            // Else we found nothing here
            node = undefined;
            // it's time to break out,
            return true;
          }
        }

        // Continue diving into the trie
        node = node[chr];
      });

      return node;
    };
  };

}).call(null, T);
