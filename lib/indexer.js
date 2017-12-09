/**
 * create a lunr indexer module to be used
 * by base-search
 * Based on: https://github.com/node-base/base-search/blob/master/example/indexer-lunr.js
 *
 * lunr 2.x now uses immutable indexes (https://lunrjs.com/guides/upgrading.html) which means
 * that the indexes must be created inside the configuration function (idx).
 * 
 */

'use strict';

var path = require('path');
var lunr = require('lunr');
var write = require('write');
var cheerio = require('cheerio');

module.exports = function() {
  
  return {
    collect: function(file, next) {
      console.log('indexing', file.key);
      var $ = cheerio.load(file.content);
      console.log('content', $('.main-content').text() );
      var title = $('title').text();
      next(null, {
        key: file.key,
        title: file.data.title || title || file.key,
        // tags: [],
        // category: file.data.category || 'docs',
        // description: file.data.description || file.data.title || file.key,
        // body: $(file.content).find('.main-content').text()
        body: $('.main-content').text()
      });
    },
    index: function(files, options, cb) {
      console.log('starting index operation', options);
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      var idx = lunr(function() {
        this.ref('key');
        this.field('title', { boost: 10000 });
        // this.field('description', { boost: 100 });
        // this.field('tags', { boost: 10 });
        // this.field('category', { boost: 10 });
        this.field('body');

        // now have to wrap add inside the call to lunr() else I'll get a 'idx.add is not a function' error
        for (var key in files) {
          if (files.hasOwnProperty(key)) {
            this.add(files[key]);
          }
        }
      });

      var fp = options.base
        ? path.join(options.base, 'lunr-search.json')
        : path.join(__dirname, 'lunr-search.json');
      console.log('writing index to', fp);


      var content = '';
      if(options.pretty){
        content = JSON.stringify({files: files, idx: idx}, null, '\t');
      }else{
        content = JSON.stringify({files: files, idx: idx});
      }
      write(fp, content, cb);
    }
  };
};