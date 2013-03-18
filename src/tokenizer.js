/**
 * This Module provides various ways of breaking down
 * search-queries & input text, into tokens for searching
 */
(function (T, undefined) {

  'use strict';

  function validator(input) {

    // Input should be a array of tokens
    if(!(input instanceof Array)) {
      return;
    }

    var tokens = [];
    input.forEach(function(token) {
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
    var pieces = input.toLowerCase().split(/[\s\'\"\.\-_]+/);
    return validator(pieces);
  }

  T.tokenizer = {
    'whitespace': whitespaceTokenizer
  };

}).call(null, T);