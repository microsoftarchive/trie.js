(function(global, undefined) {

  'use strict';

  var T = {};

  // Node.JS
  if (typeof module !== 'undefined') {
    module.exports = T;
  }
  // AMD loader like require.js
  else if (typeof define === "function" && define.amd) {
    define( "trie", function () { return T; });
  }
  // Export as global
  else {
    global.T = T;
  }

  /**
   * This Module provides various ways of breaking down
   * search-queries & input text, into tokens for searching
   */
  (function (T, undefined) {

    // 'use strict';

    function validator(input) {

      // Input should be a array of tokens
      if(!(input instanceof Array)) {
        return;
      }

      var tokens = [];
      input.forEach(function(token) {
        // TODO: see if we need to remove some unicode/control chars

        // A valid token has to be truthy
        if(!!token) {
          tokens.push(token);
        }
      });
      return tokens;
    }

    function whitespaceTokenizer (input) {

      // If multiple tokens are passed, then combine them before tokenizing
      if(input instanceof Array) {
        input  = input.join(' ');
      }

      // input should have a length
      if(!input || !input.length) {
        return;
      }

      // Split the input by whitespaces, quotes, dots, dashes, or underscores
      var pieces = input.toLowerCase().split(/[\s\'\"\.\-_]+/);
      return validator(pieces);
    }

    T.tokenizer = {
      'whitespace': whitespaceTokenizer
    };

  }).call(null, T);

  (function(T, undefined) {

    // 'use strict';

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

  (function(T, undefined) {

    // 'use strict';

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

  /**
   * This module resolves a location in the trie-structure
   * where a new token should be added when indexing
   * or when looking up
   */
  (function(T, undefined) {

    // 'use strict';

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

  (function (T, undefined) {

    // 'use strict';

    function Index(config) {

      config = config || {};

      var index = this;
      index._trie = {};

      // Private methods
      index._name = config.name || T.helpers.uuid();
      index._tokenize = T.tokenizer[config.tokenizer] || T.tokenizer.whitespace;
      index._resolve = T.resolver(index);

      // Public methods
      index.add = T.indexer(index);
      index.search = T.searcher(index);

      return index;
    }

    T.Index = Index;

  }).call(null, T);

  (function(T, undefined) {

    // 'use strict';

    function flatten (node) {

      var refs = [];
      if(!node) {
        return refs;
      }

      var key, ids;
      for (key in node) {
        if (key.length > 1) {
          continue;
        }
        refs = refs.concat(flatten(node[key]));
      }

      if (node.refs instanceof Array) {
        ids = node.refs.map(function(ref) {
          return ref.id;
        });
        refs = refs.concat(ids);
      }

      return refs;
    }

    // Each index should have it's own searcher as well
    T.searcher = function searcher (index) {

      return function (text) {

        if (text === undefined) {
          return [];
        }

        var tokens = index._tokenize(text) || [];
        var references = [];

        tokens.forEach(function (token) {
          // Lookup in the inverted Index
          var node = index._resolve(token);
          // Return a flat array of all matching IDs
          references.push(flatten(node));
        });

        if (references.length) {
          var meta = references;
          references = [];
          meta.forEach(function(arr) {
            arr.forEach(function(id) {
              if(references.indexOf(id) === -1) {
                references.push(id);
              }
            });
          });
        }
        return references;
      };
    };


  }).call(null, T);

}).call(null, this);