# asm-lunr-test
Experimental integration of lunr.js inside an Assemble.js project

## Purpose
Build an example indexing pipeline and client-side search interface to use as a reference when adding search to a production Assemble site.

## Implementation
Will use the `base-search` module to integrate [lunr](https://lunrjs.com) into the [assemble](https://github.com/assemble/assemble) workflow. [Base-search](https://github.com/node-base/base-search), provides an API to write indexers that bridge the differences between lunr and an Assemble pipeline plugin. We write a custom indexer that suits our implementation needs and pass into base-search as an object. Inside out _content_ task we pipe our pages through the indexer for processing. When all pages have been processed, we then write out an search index as a JSON file into our destination directory.

We can then load the search index into a front-end script for preforming searches.

Next, write a CLI script to test the file by searching from the command line. This allows us to quickly preform test searches on our new index and make sure we're capturing all the content we want to index.

## Gotchas
_Issues, little or large, that I ran into while building the demo. But you're a smart developer, so you'll probably won't fall for these._

Lunr.js v2.x uses [immutable indexes](https://lunrjs.com/guides/upgrading.html) which means once an instance is created you can't add additional items. Docs don't say why, but I'm guessing it's performance related. When you create the instance of your Lunr object, index your pages at the same time.

The `indexer.js` script will, by default, save the index file in a path relative to itself (That is, relative to `/lib/`). I deal with this by setting the path inside the assemble file and passing it as an option to the indexer.

I think [cherrio's](https://github.com/cheeriojs/cheerio) API has change recently because the example indexer script in the base-search repo didn't index page contents the first time I tried it. I updated the script to use syntax from cherrio's README.



## References
[base-search](https://github.com/node-base/base-search)

Examples of [Assemble integration](https://github.com/node-base/base-search/blob/master/example/index.js) and [custom indexer](https://github.com/node-base/base-search/blob/master/example/indexer-lunr.js)

How to prebuild an index in lunr
https://lunrjs.com/guides/index_prebuilding.html

An example of using lunr with Grunt, has a simple search implimentation
https://matthewdaly.co.uk/blog/2015/04/18/how-i-added-search-to-my-site-with-lunr-dot-js/

Cherrio.js: server-side jquery API
https://github.com/cheeriojs/cheerio

## To Run Example
Clone repo and cd into it

`nvm use` to load compatible node version

`npm i` to install dependencies

`assemble content` runs the content task and outputs the html pages into `./dist`. The index is outputed into `./dist/data`.

`node search.js [search terms]` will perform a search on the index.

`assemble` builds the site and launches it in your browser.




