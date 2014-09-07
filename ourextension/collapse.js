( function () {
	var citationz = document.getElementById("readability-content");
	var text = citationz.innerHTML; 
	var index = 0;
	var str = text.substr(index);
	var mine = str;
	var myreg = /\(.*?(,\W+|\d|\.).*?((\d|\.)[a-z]?)\)/g;

	while((resultz = myreg.exec(str)) !== null){
		var str = str.substr(index);
		var sub = resultz[0];
		var len = sub.length;
		var yus = sub.substr(1, len-2);
		index = myreg.lastindex;
		var nnew = "<a title=\"" + yus + "\">(...)</a>" + " ";
		mine = mine.replace(resultz[0], nnew);
	}

	citationz.innerHTML = mine;

})();
