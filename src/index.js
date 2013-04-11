(function (T) {

  'use strict';

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
    var intersectResults = !!config.intersectResults ? true : false;

    // Private
    index._name = config.name || T.helpers.uuid();
    index._tokenize = T.tokenizer[config.tokenizer] || T.tokenizer.whitespace;
    index._resolve = T.resolver(index);

    // Public methods
    index.add = T.indexer(index, subStringIndexingEnabled);
    index.search = T.searcher(index, intersectResults);

    // Persistance methods
    var idb = T.storage.indexeddb;
    if(idb.isSupported) {
      index.save = idb.saver(index);
      index.load = idb.loader(index);
    }

    // Codec functions
    index.compress = T.codec.compresser(index);
    index.decompress = T.codec.decompresser(index);

    return index;
  }

  T.Index = Index;

}).call(null, T);
