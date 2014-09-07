( function () {
	var content = document.getElementById("readability-content");
	var extracted = content.innerHTML.substr(index); 
	var index = 0;
	var collapse_content = extracted;

	var cit_regex = /(\(([^\)]*)(((\d{4}|([p][a][r][a]\.[[:space:]]\d+)|([p]\.[[:space:]]\d+))[a-z]?|\.))\))/g;

	while((cit_match = cit_regex.exec(extracted)) !== null){
	
			var str = str.substr(index);
			var sub = cit_match[0];
			var len = sub.length;
			var strip_paren = sub.substr(1, len-2);
			index = cit_regex.lastindex;
			var format = "<a title=\"" + strip_paren + "\">(...)</a>" + " ";
			collapse_content = collapse_content.replace(cit_match[0], format);

	}

	content.innerHTML = collapse_content;

})();
