(function() {

  'use strict';

  var expect = require('chai').expect;
  var T = require('../dist/trie');

  // The following trie was generated like this
  /** ```
    var index = new T.Index('countries');
    index.add(1, 'Austria');
    index.add(2, 'Australia');
    index.add(3, 'KoreaNorth');
    index.add(4, 'KoreaSouth');
    JSON.stringify(index._trie);
  *** ```
  */
  var trie = {"a":{"u":{"s":{"t":{"r":{"i":{"a":{";":[1]}},"a":{"l":{"i":{"a":{";":[2]}}}}}}}}},"k":{"o":{"r":{"e":{"a":{"n":{"o":{"r":{"t":{"h":{";":[3]}}}}},"s":{"o":{"u":{"t":{"h":{";":[4]}}}}}}}}}}};

  // The compression should be prefix-only
  // since we hold extra data on reference nodes (aka ;), we can't compress from suffix sides
  var output = {
    "austr": {
      "ia": { ";": [1] },
      "alia": { ";": [2] }
    },
    "korea": {
      "north": { ";": [3] },
      "south": { ";": [4] }
    }
  };

  describe('Codec', function () {
    it('prefix compression', function () {
      // We could do `index.compress()`,
      // but specs should test only functionality of one module
      var out = T.codec.compresser({'_trie': trie})();
      expect(out).to.deep.equal(output);
    });
  });

}).call();
