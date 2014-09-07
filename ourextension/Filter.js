function httpGet( theUrl )
{
  var url = "https://www.readability.com/api/content/v1/parser?url=" + theUrl + "&token=8eb05a4320c1ad21786e8270ffbcbe0f80d9f711";
  var xhr = new XMLHttpRequest();
  xhr.open( "GET", url , false );
  xhr.send( null );
  return xhr.responseText;
}

chrome.tabs.getSelected( null, function(tab)
{
	//title
	var divTitle = document.createElement("div");
 	var json = JSON.parse( httpGet( tab.url ) );
 	divTitle.innerHTML = json["title"];
	divTitle.style.fontSize = "32px";
	divTitle.style.fontWeight = "bold";
	if(divTitle.innerHTML != "undefined")
	{
		document.body.appendChild( divTitle );
	}
	
// 	document.body.appendChild( div );

 	var div = document.createElement("div");
 	//var json = JSON.parse( httpGet( tab.url ) );
 	div.innerHTML = json["content"];
	if(div.innerHTML == "undefined")
	{
		div.innerHTML = "Sorry, Could Not Complete Request";
	}
	else
	{
		div.style.width = "700px";
	}
 	document.body.appendChild( div );
//  	var readability = new readability();
 });

// chrome.tabs.executeScript(null, {file: "/assets/scripts/core.js"});
