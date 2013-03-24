(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');
  var UglifyJS = require('uglify-js');
  require('colors');

  // Uglify programmatically
  function compress(code) {
    var tree = UglifyJS.parse(code);
    tree.figure_out_scope();
    var compressor = UglifyJS.Compressor();
    var ast = tree.transform(compressor);
    ast.figure_out_scope();
    ast.compute_char_frequency();
    ast.mangle_names();
    var stream = UglifyJS.OutputStream();
    ast.print(stream);
    return stream.toString();
  }

  function toKB(str) {
    return '(' + (Math.round(str.length / 10) / 100) + ' kB)';
  }

  // Module names, in correct sequence
  var MODULES = [
    'helpers',
    'tokenizer',
    'resolver',
    'indexer',
    'searcher',
    'storage/indexeddb',
    'codec',
    'porter',
    'index'
  ];

  // Start
  console.log('\nBuilding Trie.JS'.blue);

  // Collect all code lines in an array
  var buffer = [];
  MODULES.forEach(function (module) {

    // Add delimiter comments to help debugging
    buffer.push('// Module: ' + module);

    var filePath = path.join(__dirname, 'src', module + '.js');
    var code = fs.readFileSync(filePath).toString();

    // Copy over the modules indented by 2 spaces
    // (yes, I'm an indentation nazi)
    var lines = code.split(/[\n\r]+/);
    lines.forEach(function (line) {

      // One 'use strict' in the entire built JS is enough
      if(/^\s*\'use strict\';\s*$/.test(line)) {
        return;
      }

      buffer.push('  ' + line);
    });
  });

  // Wrap it all in a closure
  var wrapperPath = path.join(__dirname, 'src/T.js');
  var wrapper = fs.readFileSync(wrapperPath).toString();
  var outCode = wrapper.replace('//{{MODULES_GO_HERE}}', buffer.join('\n'));

  // Write out a distributable version of the JS
  var outFilePath = path.join(__dirname, 'dist/trie.js');
  fs.writeFileSync(outFilePath, outCode);
  console.log('  \u2713'.green, 'trie.js'.white, toKB(outCode));

  // And a minified version
  var minFilePath = path.join(__dirname, 'dist/trie.min.js');
  var compressedCode = compress(outCode);
  fs.writeFileSync(minFilePath, compressedCode);
  console.log('  \u2713'.green, 'trie.min.js'.white, toKB(compressedCode));

  console.log('---- Success ----'.green);

}).call(null);
