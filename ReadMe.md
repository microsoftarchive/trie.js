# Work-In-Progress

## Trie.JS

[![Build Status](https://travis-ci.org/netroy/trie.js.png?branch=master)](https://travis-ci.org/netroy/trie.js)

Yet another trie-structure implementation in JS to help solve the problem of missing `Full Text Search in IndexedDB`.

It persists on IndexedDB right now, but there are plans for FileSystemAPI based persistance later.

---

### Done

* Basic trie structure generation
* Lookup in the trie
* IndexedDB based persistance
* Build tool
* Option to enable prefix-only indexing (much faster)
* Trie Compresser (for exporting)

### TODO

* **Spec Runner**
* **Handle older IDB specs** & other errors around IDB
* **Pre-open connection**, for faster loading of indices
* Trie Decompresser (for importing)
* Make trie smaller (use a better structure)
* Ranking (weight based)
* Alternate tokenizers
* FileSystemAPI based persistance of the index
* Stemming ? (English only at first & optional)
* Extra related text (for matching across languages), like deustchland for germany & भारत for India
* Character replacement in alternate spelling for non-english names (phonetic)
* AND / OR queries (how to merge results from multiple tokens)

---

### Guidelines ###

* JSHinted with the included .jshintrc, in strict mode
* Specs in mocha