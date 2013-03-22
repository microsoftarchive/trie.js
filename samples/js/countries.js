(function () {

  'use strict';

  // var log = console.log.bind(console);
  // No timing in IE (sucker)
  if(!console.time) {
    console.time = console.timeEnd = function() {};
  }

  var countries, index;

  function indexData() {
    index = new T.Index('countries');
    console.time('loading');
    index.load(function(err) {
      if(err) {
        console.time('indexing');
        Object.keys(countries).forEach(function(id) {
          var country = countries[id];
          var toIndex = [country.name , country.alternate].join(' ');
          index.add(id, toIndex, country.weight || 1);
        });
        console.timeEnd('indexing');
        console.time('saving');
        index.save(function() {
          console.timeEnd('saving');
        });
      }
      else {
        // Already loaded

        window.index = index;
        console.timeEnd('loading');
      }
    });
  }

  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {

    if(request.readyState === 4) {
      // Break the cyclic reference
      request.onreadystatechange = null;
      if (typeof request.responseText === "string") {
        try {
          countries = JSON.parse(request.responseText);
        } catch(e) {
          // do something
        }

        // Index, if data was loaded
        if(countries) {
          indexData();
        }
      }
    }
  };
  request.open('get', 'data/countries.json', true);
  request.send();


  var search = document.getElementById('search');
  var results = document.getElementById('results');

  var lastVal;
  function lookup() {

    var query = search.value;
    if(lastVal === query) {
      return;
    }

    // Time the lookup
    console.time('lookup: ' + query);
    var ids = index.search(query);
    console.timeEnd('lookup: ' + query);

    // render the list
    results.innerHTML = ids.map(function(id) {
      var country = countries[id];
      return '<li>' + country.name + '</li>';
    }).join('');
    lastVal = query;
  }

  search.addEventListener('keyup', lookup, false);

}).call(null);