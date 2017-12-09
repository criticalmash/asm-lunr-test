'use strict';

/* outside modules */
var assemble = require('assemble');
var extname = require('gulp-extname');
var midden = require('assemble-midden');
var browserSync = require('browser-sync').create();
var watch = require('base-watch');
var path = require('path');
var search = require('base-search');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const markdownMid = require('assemble-middleware-md');
var permalinks = require('assemble-permalinks');
var through = require('through');

/* Create app */
var app = assemble();
app.use(watch());
app.use(permalinks());


app.helper('midden', midden(true));
app.pages.onLoad(/\.md$/, markdownMid());

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

/**
 * Cheep and easy permalinks
 */
app.pages.preRender(/./, function newslog(view, next) {
    view.data.link = view.data.path.replace(view.data.base, '');
    next(null, view);
});

app.task('content', ['layouts'], function() {
  app.pages('src/content/**/*.{md,hbs}');
  return app.toStream('pages')
    .pipe(extname())
    .pipe(app.renderFile())
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
  app.src('node_modules/midden/dist/js/**/*.js')
    .pipe(app.dest('dist/js'))
    .pipe(browserSync.stream());

  return app.src('src/js/**/*.js')
    .pipe(app.dest('dist/js'))
    .pipe(browserSync.stream());
});

const styleIncludes = [
  'node_modules/midden/dist/styles/'
];
app.task('css', function () {
  return app.src('src/scss/app.scss')
    .pipe(sass({includePaths: styleIncludes}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(app.dest('dist/css'))
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
  app.watch('src/layouts/**/*.hbs', ['content']);
  app.watch('src/js/**/*.js', ['scripts']);
});

app.task('default', ['content', 'scripts'], app.parallel(['serve', 'watch']));


/* Export app */
module.exports = app;
