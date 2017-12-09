/**
 * Preforms a site-wide search inside the browser
 */

var idx;  // lunr index
var files; // meta info about index pages
var resultsPerPage = 10;

function makeSearch(queryString){
  var results = idx.search(queryString);
  var count = results.length;
  var page = results.slice(0,resultsPerPage);
  var pageCount = Math.ceil(count/resultsPerPage);
  console.log(results);

  // clear any old results
  var results = $('#results');
  results.empty();

  for (var i = 0; i < page.length; i++) {
    var result = page[i];
    var key = result.ref;
    var meta = files[key];
    var link = $('<p><a href="' + result.ref + '">' + meta.title + '</a></p>');
    results.append(link);
    var beginMatch = getFirstOccuranceOfTerm(result);
    var start = beginMatch - 50;
    var end = beginMatch + 150;
    var summary = $('<p>' + beginMatch + " -- " + meta.body.substring(start, end) + '</p>');

    results.append(summary);
  };
}

/**
 * so we can reverse sort by number instead of by alpha
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
function compareNumbersReverse(a, b) {
  return b - a;
}

/**
 * getFirstOccuranceOfTerm inspects a result item and get the first
 * occurance of a search term in the body.
 * @param  {Object} result    A result item
 * @return {Interger}         location of terms' first appearance
 */
function getFirstOccuranceOfTerm(result){
  var metadata = result.matchData.metadata;
  var first = [];
  for (var term in metadata) {
    first.push(metadata[term].body.position[0][0]);
  }
  return first.sort(compareNumbersReverse).pop()
}

function loadIndex () {
  var indexUrl = '/data/lunr-search.json';
  $.ajax({
    url: indexUrl
  })
  .done(function (data) {
    // console.log(data);
    idx = lunr.Index.load(data.idx);
    files = data.files;
    console.log('index loaded');
  });
}


$(document).ready(function () {
  loadIndex();
  $('#search-field').keyup(function(event){
    var value = $('#search-field').val();
    console.log('value: ', value);
    if (value.length > 2) {
      makeSearch(value);
    };
  });  
});