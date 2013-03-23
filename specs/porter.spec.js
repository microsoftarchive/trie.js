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
  var trie = {"a":{"u":{"s":{"t":{"r":{"i":{"a":{";":[{"id":1}]}},"a":{"l":{"i":{"a":{";":[{"id":2}]}}}}}}}}},"k":{"o":{"r":{"e":{"a":{"n":{"o":{"r":{"t":{"h":{";":[{"id":3}]}}}}},"s":{"o":{"u":{"t":{"h":{";":[{"id":4}]}}}}}}}}}}};

  // The compression should be prefix-only
  // since we hold extra data on reference nodes (aka ;), we can't compress from suffix sides
  var output = {
    "austr": {
      "ia": {
        ";": [ { "id": 1 } ]
      },
      "alia": {
        ";": [ { "id": 2 } ]
      }
    },
    "korea": {
      "north": {
        ";": [ { "id": 3 } ]
      },
      "south": {
        ";": [ { "id": 4 } ]
      }
    }
  };

  describe('Array', function () {

    describe('#indexOf()', function () {

      it('blah', function () {
        var out = T.porter.compress(trie);
        expect(out).to.deep.equal(output);
      });
    });
  });

}).call();
