(function (T) {

  'use strict';

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

  function compresser (index) {
    return function () {
      return compress(index._trie);
    };
  }

  T.codec = {
    'compresser': compresser
  };

}).call(null, T);