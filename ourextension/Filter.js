function httpGet( theUrl )
{
  var url = "https://www.readability.com/api/content/v1/parser?url=" + theUrl + "&token=8eb05a4320c1ad21786e8270ffbcbe0f80d9f711";
  var xhr = new XMLHttpRequest();
  xhr.open( "GET", url , false );
  xhr.send( null );
  return xhr.responseText;
}

window.onload = alert( httpGet( document.URL ) );