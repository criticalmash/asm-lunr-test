'use strict';

/* outside modules */
var assemble = require('assemble');
var extname = require('gulp-extname');
var midden = require('assemble-midden');
var browserSync = require('browser-sync').create();
var watch = require('base-watch');
var path = require('path');
var search = require('base-search')

/* Create app */
var app = assemble();
app.use(watch());


app.helper('midden', midden(true));

/**
 *  Configure base-search to use lunr and custom indexer
 */
app.use(search({ indexer: 'lunr', base: path.join(__dirname, 'dist/data'), pretty: 'pretty' }));
app.search.indexer('lunr', require('./lib/indexer')());

/**
 * Create tasks
 */

/* Load templates */
app.task('layouts', function (cb) {
  app.layouts('src/layouts/**/*.hbs');
  cb();
});

app.option('layout', 'default');


app.task('content', ['layouts'], function() {
  app.pages('src/content/**/*.{md,hbs}');
  return app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(extname())
    .pipe(app.search.collect())
    .pipe(app.dest('dist'))
    .pipe(browserSync.stream())
    .on('end', function() {
      app.search.index(function(err) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log('index written');
      });
    });
});

/**
 * drops a copy of the search client into the dist directory
 */
app.task('scripts', function() {
  return app.src('src/js/**/*.js')
    .pipe(app.dest('dist/js'))
    .pipe(browserSync.stream());
});

app.task('serve', function () {
  browserSync.init({
    port: 8080,
    startPath: 'index.html',
    server: {
      baseDir: 'dist'
    }
  });
});

app.task('watch', function () {
  app.watch('src/content/**/*.{md,hbs}', ['content']);
  app.watch('src/js/**/*.js', ['scripts']);
});

app.task('default', ['content', 'scripts'], app.parallel(['serve', 'watch']));


/* Export app */
module.exports = app;
