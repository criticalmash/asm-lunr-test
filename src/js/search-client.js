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
  console.log(page);

  // clear any old results
  var results = $('#results');
  results.empty();

  for (var i = 0; i < page.length; i++) {
    var result = page[i];
    var key = result.ref;
    var meta = files[key];
    var link = $('<p><a href="' + result.ref + '">' + meta.title + '</a></p>');
    results.append(link);
  };
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