# Work-In-Progress

## Trie.JS

Yet another trie-structure implementation in JS to help solve the problem of missing `Full Text Search in IndexedDB`.

It persists on IndexedDB right now, but there are plans for FileSystemAPI based persistance later.

---

### Done

* Basic trie structure generation
* Lookup in the trie
* IndexedDB based persistance
* Build tool

### TODO

* **Spec Runner**
* **Handle older IDB specs** & other errors around IDB
* **Option to enable prefix-only indexing/searching** (much faster, disables full-text search)
* **Pre-open connection**, for faster loading of indices

##### Others

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