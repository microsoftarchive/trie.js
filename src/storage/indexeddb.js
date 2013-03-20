(function(T, global, undefined) {

  'use strict';

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
    'saver': saver,
    'loader': loader
  };

}).call(null, T, window);
