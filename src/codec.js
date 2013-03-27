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

  function decompress (cTrie) {

    var trie = {};
    var node = trie;

    Object.keys(cTrie).forEach(function(key) {
      var inode = node;
      if(key === ';') {
        inode[';'] = cTrie[';'];
      } else {
        var chars = key.split('');
        while(chars.length) {
          var chr = chars.shift();
          if(chars.length === 0) {
            inode[chr] = decompress(cTrie[key]);
          } else {
            inode[chr] = inode[chr] || {};
            inode = inode[chr];
          }
        }
      }
    });

    return trie;
  }

  function compresser (index) {
    return function () {
      return compress(index._trie);
    };
  }

  function decompresser (index) {
    return function (trie) {
      index._trie = decompress(trie);
    };
  }

  T.codec = {
    'compresser': compresser,
    'decompresser': decompresser
  };

}).call(null, T);