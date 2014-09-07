chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(null, {file: "readability.js"});
	chrome.tabs.insertCSS( tab.id, {file: "readability.css" });
	chrome.tabs.insertCSS( tab.id, {file: "readability-print.css" });
});

