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

// Module: helpers
  (function (T) {
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

// Module: tokenizer
  /**
   * This Module provides various ways of breaking down
   * search-queries & input text, into tokens for searching
   */
  (function (T) {
    function validator(input) {
      // Input should be a array of tokens
      if(!(input instanceof Array)) {
        return;
      }
      var tokens = [];
      input.forEach(function (token) {
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
      var pieces = input.toLowerCase().split(/[\s\'\"\.\-_;]+/);
      return validator(pieces);
    }
    T.tokenizer = {
      'whitespace': whitespaceTokenizer
    };
  }).call(null, T);

// Module: resolver
  /**
   * This module resolves a location in the trie-structure
   * where a new token should be added when indexing
   * or when looking up
   */
  (function (T, undefined) {
    T.resolver = function resolver (index) {
      // Let each Index have it's own resolver
      return function (token, isForIndexing) {
        // Start resolving from the top
        var node = index._trie;
        // Split the token to individual characters
        var chars = token.split('');
        // dive into the Trie-structure, use `some` to break out of the loop
        chars.some(function (chr) {
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

// Module: indexer
  (function (T, undefined) {
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
          var reference = {
            'id': id
            // TODO: use position/distances for better ranking
            // ,'position': i
            // TODO: use weight
          };
          // Split chars & create a regular trie for prefix search
          var node = index._resolve(token, true);
          node[';'] = node[';'] || [];
          node[';'].push(reference);
          // Also insert suffixes with length > 2 in the trie, for partial match
          if (subStringIndexingEnabled && token.length > 2) {
            for(var j = 1, l = token.length - 1; j < l; j++) {
              node = index._resolve(token.substr(j), true);
              node[';'] = node[';'] || [];
              node[';'].push(reference);
            }
          }
        });
      };
    };
  }).call(null, T);

// Module: searcher
  (function(T, undefined) {
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
      if (node[';'] instanceof Array) {
        ids = node[';'].map(function(ref) {
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
        // TODO: decide if the results should be an AND/OR or the references at this point
        if (references.length) {
          var meta = references;
          references = [];
          meta.forEach(function (arr) {
            arr.forEach(function (id) {
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

// Module: storage/indexeddb
  (function(T, global) {
    var dbName = 'trie.js';
    var dbVersion = '1.0';
    var storeName = 'indices';
    var indexedDB = global.indexedDB || global.webkitIndexedDB || global.mozIndexedDB || global.msIndexedDB;
    function setupDB(e) {
      var db = e.target.result.db || e.target.result;
      db.createObjectStore(storeName);
    }
    function connect(callback) {
      var dbOpenReq = indexedDB.open(dbName, dbVersion);
      dbOpenReq.onupgradeneeded = setupDB;
      dbOpenReq.onsuccess = function (e) {
        var db = e.target.result;
        callback(null, db);
      };
      dbOpenReq.onerror = function() {
        var err = new Error('failed opening database');
        callback(err);
      };
    }
    function saver(index) {
      // Every Index gets its own `save`
      return function (callback) {
        if(!callback || !callback.call) {
          callback = function() {};
        }
        connect(function(err, db) {
          if(err) {
            return callback(err);
          }
          var transaction = db.transaction([storeName], 'readwrite');
          var store = transaction.objectStore(storeName);
          var request = store.put(index._trie, index._name);
          request.onsuccess = function() {
            db.close();
            callback(null);
          };
          request.onerror = function() {
            db.close();
            var err = new Error('failed saving the trie ' + index._name);
            callback(err);
          };
        });
      };
    }
    function loader(index) {
      // Every Index gets its own `load`
      return function (callback) {
        if(!callback || !callback.call) {
          callback = function() {};
        }
        connect(function(err, db) {
          if(err) {
            return callback(err);
          }
          var transaction = db.transaction([storeName], 'readonly');
          var store = transaction.objectStore(storeName);
          var request = store.get(index._name);
          request.onsuccess = function(e) {
            db.close();
            var trie = e.target.result;
            if(trie) {
              index._trie = trie;
              callback(null);
            }
            else {
              var err = new Error('first load');
              callback(err);
            }
          };
          request.onerror = function() {
            db.close();
            var err = new Error('failed loading the trie ' + index._name);
            callback(err);
          };
        });
      };
    }
    T.storage = T.storage || {};
    T.storage.indexeddb = {
      'isSupported': !!indexedDB,
      'saver': saver,
      'loader': loader
    };
  }).call(null, T, window);

// Module: porter
  (function (T) {
    function compress (trie) {
      var compressedTrie = {};
      var forked = false, keys, prefix = '', node = trie;
      // Dive into the trie
      while(!forked) {
        keys = Object.keys(node);
        // If only one key is found, make the node shallower
        if(keys.length === 1 && keys[0] !== ';') {
          prefix += keys[0];
          node = node[keys[0]];
        }
        // Otherwise break out & compress the subtrees
        else {
          forked = true;
        }
      }
      // Add the long prefix to the new node & move over to that point
      var newNode = compressedTrie;
      if(prefix.length > 0) {
        newNode = compressedTrie[prefix] = {};
      }
      // Start copying over subnodes
      keys.forEach(function (key) {
        // These beautiful semicolons are refs arrays, don't touch them
        if (key === ';') {
          newNode[';'] = node[';'];
        }
        // Compress all other nodes just like the parents
        // And copy over the new keys & subtrees
        else {
          var another = {};
          another[key] = node[key];
          another = compress(another);
          Object.keys(another).forEach(function(subKey) {
            newNode[subKey] = another[subKey];
          });
        }
      });
      return compressedTrie;
    }
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
      'compress': compress,
      'importer': importer,
      'exporter': exporter
    };
  }).call(null, T);
// Module: index
  (function (T) {
    function Index(config) {
      config = config || {};
      // If the first arg is a string, it's the name for the index
      if(T.helpers.isString(config)) {
        config = {
          'name': config
        };
      }
      var index = this;
      index._trie = {};
      // To conditionally disable substring/suffix indexing
      var subStringIndexingEnabled = !!config.indexSubstring ? true : false;
      // Private
      index._name = config.name || T.helpers.uuid();
      index._tokenize = T.tokenizer[config.tokenizer] || T.tokenizer.whitespace;
      index._resolve = T.resolver(index);
      // Public methods
      index.add = T.indexer(index, subStringIndexingEnabled);
      index.search = T.searcher(index);
      // Persistance methods
      var idb = T.storage.indexeddb;
      if(idb.isSupported) {
        index.save = idb.saver(index);
        index.load = idb.loader(index);
      }
      return index;
    }
    T.Index = Index;
  }).call(null, T);


}).call(null, this);
