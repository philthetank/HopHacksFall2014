function filterCitations( ) {
  var citation = /\(.*\)/g
  document.body.innerHTML = document.body.innerHTML.replace( citation , "(...)" )
}


window.onload = filterCitations( );
