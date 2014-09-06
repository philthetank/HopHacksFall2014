/*
 CFG parser
 v1.00 
 By Peter van der Zee
 http://cfg.qfox.nl
 September 2010

 This script parses a cfg (with specific markup) and converts it to an internal model
 The markup is very simple. It allows for productions with rules which have elements.
 There is support for literals, unicode literals, comments and sections.
 
 Usage: 
 Feed the source to CfgParser.parseString or the id of a script element to
 CfgParser.parseId and let the magic happen.
 
 Syntax:
 A production starts on an empty line with a colon followed by its name.
 For compactness, the name may be followed by a rule. Subsequent rules that do not
 start with a colon are assumed to be rules of this production. A rule consists of one
 or more elements or parts. Every part can be another production, a special produciton
 or a literal (string or unicode).
 All whitespace is ignored (regular spaces and tabs) except in literals. You can escape
 a literal with the backslash (needed when you want a double quote as string literal).
 There are four special production types: not, any, optional and exception. The syntax
 for each of these is the same sort: n{} a{} o{} e{}, in that order. Inside the curlies
 should go elements for that production. These productions all have a single rule. You
 can escape the curly with a backslash. 
 The special productions may be nested: a{e{n{Some} Weird} Nesting} and always count as
 a single element, whatever the contents be, like regular productions.
 Comments start with a hash and whatever comes after the hash is ignored until the next
 newline (\n, \r, \f).
 Sections can be created by starting a line with a dollar sign ($) followed by the name
 of the section. All productions that follow are grouped together by that name.

 Use this script however you wish. I would appreciate it if you kept my name in the source.
 Use at your own risk. I'm not responsible for any bugs still in this script! :)

*/

/**
 * Create and initialize a cfg parser. Will parse given source 
 * or id and is able to output the results.
 * @public
 * @constructor
 * @param {String} id If not idIsSource, this is the id of the element that contains the cfg. otherwise it is the source. 
 * @param {Boolean} idIsSource=false Is the id an id or the source?
 * @param {Object} parseNow=false Start parsing immediately?
 * @return {CfgParser}
 */
var CfgParser = function(id, idIsSource, parseNow){
	// id with cfg contents to parse
	if (!idIsSource) this.source = (document.getElementById(id)||{}).text||'';
	// use (html) color in output of cfg objects?
	this.bColor = false;
	
	if (parseNow) this.parse();
};
/**
 * Start parsing given source and return a CfgParser object
 * @public
 * @param {String} source
 * @return {CfgParser}
 */
CfgParser.parseSource = function(source){
	return new CfgParser(source, true, true);
};
/**
 * Start parsing the source in given script id and return a CfgParser object
 * @public
 * @param {String} id
 * @return {CfgParser}
 */
CfgParser.parseId = function(id){
	return new CfgParser(id, false, true);
};
/**
 * Determine whether given character is a space, tab or return
 * @private
 * @param {String} chr
 * @return {Boolean}
 */
CfgParser.isWhite = function(chr){
	return chr == ' ' || chr == '\t' || chr == '\n' || chr == '\r' || chr == '\f';
};
/**
 * Determine whether given character is a return
 * @private
 * @param {String} chr
 * @return {String}
 */
CfgParser.isReturn = function(chr){
	return chr == '\n' || chr == '\r' || chr == '\f';
};

/**
 * This object represents a production of the cfg. A production contains
 * zero or more rules which each contain one or more elements. It can
 * also be a special production, where the name of the production will
 * signify a specific action should be taken by the parser.
 * @param {String} name The name for this production
 * @param {Array{CfgParser.Rule}|String} rules The rules for this production or the value for this literal
 * @param {Array} elements An array passed on by the owning cfgparser which will contain all elements
 */
CfgParser.Production = function(name,rules,elements){
	this.name=name;
	this.value=rules;
	
	if (name) {
		// if an element for this name is already used, attach this production to it
		if (name in elements) elements[this.name].production = this;
		// otherwise create a new production for it
		else elements[this.name] = new CfgParser.Element(name, this, elements);
	}
};
/**
 * @return {String}
 */
CfgParser.Production.prototype.toString = function(){ 
	return "Production["+this.name+":"+this.value+"]"; 
};
/**
 * Convert the production to an html string
 * @param {int} depth
 * @param {Boolean} whitespace
 * @return {String}
 */
CfgParser.Production.prototype.myString = function(depth, whitespace){
	depth = depth || 0;
	var s = '';
	if (!whitespace) s = new Array(depth+1).join("  ");
	if (this.name) s += (whitespace?"":"\n")+": <a name='"+this.name+"'>"+this.name+"</a>"+(whitespace?"":"\n");
	if (this.value) {
		for (var i=0; i<this.value.length; ++i) {
			if (this.value[i]) s += this.value[i].myString(depth+1, whitespace)+(whitespace?"":"\n");
		}
	}
	if (this.bColor) s = '<span style="color:blue;">'+s+'</span>';
	return s;
};
/**
 * What type of Production is this? Always returns "Production"
 * @return {String}
 */
CfgParser.Production.prototype.type = function(){ return 'Production'; };
/**
 * @constructor
 * @param {Array} parts the element parts of this rule
 * @return {CfgParser.Rule}
 */
CfgParser.Rule = function(parts){
	this.value=parts;
};
/**
 * @return {String}
 */
CfgParser.Rule.prototype.toString = function(){ 
	return "Rule["+this.value+"]"; 
};
/**
 * Convert the rule to an html string
 * @param {int} depth
 * @param {Boolean} whitespace
 * @return {String}
 */
CfgParser.Rule.prototype.myString = function(depth, whitespace){
	depth = depth || 0;
	var s = '';
	if (!whitespace) s = new Array(depth+1).join("  ");
	if (this.value) {
		for (var i=0; i<this.value.length; ++i) {
			if (i) s += ' ';
			if (this.value[i]) {
				if (this.value[i].myString) s += this.value[i].myString(depth+1);
				else s += this.value[i].toString(depth+1);
			}
		}
	}
	if (this.bColor) s = '<span style="color:green;">'+s+'</span>';
	return s;
};
/**
 * Always returns "Rule"
 * @return {String}
 */
CfgParser.Rule.prototype.type = function(){ return 'Rule'; };

/**
 * Create a new element, which is the atomic part of a Rule
 * @param {String} name
 * @param {CfgProduction} production The production that was found
 * @param {Array} elements Global array from owning cfg containing all elements
 * @return {CfgParser.Element}
 */
CfgParser.Element = function(name, production, elements){
	// if there's already an element by this name
	// return that element. that way we can attach
	// the actual production object to all elements
	// that reference it, in one swoop.
	if (name in elements) return elements[name];
	
	// stash this element in the elements array (its new)
	this.value = name;
	elements[name] = this;
	
	// combine with production if one was given
	if (production) {
		this.production = production;
		production.element = this;
		production.isNew = true;
	}
};
/**
 * @return {String}
 */
CfgParser.Element.prototype.toString = function(){ 
	return "Element["+this.value+"]"; 
};
/**
 * Convert the element to an html string
 * @param {int} depth
 * @return {String}
 */
CfgParser.Element.prototype.myString = function(depth){
	depth = depth || 0;
	var s = "";
	if (this.value) {
		if (typeof this.value == 'string') s = this.value;
		else if (this.value.myString) s = this.value.myString(depth+1);
		else s = this.value.toString();
	} else s = '&lt;?E?&gt;';
	if (this.bColor) s = '<span style="color:purple;">'+s+'</span>';
	if (!this.production) s = '<strike>'+s+'</strike>';
	else if (this.production.name) s = '<a href="#'+this.production.name+'" style="text-decoration: none;">'+s+'</a>';
	return s;
};
/**
 * Always returns "Element"
 * @return {String}
 */
CfgParser.Element.prototype.type = function(){ return 'Element'; };

/**
 * A literal is a string that must be matched exactly and completely
 * on the source starting at "the current position" and onwards until
 * the entire literal matched. Keywords and operators are usually
 * literals. Special productions too but they are not wrapped in this
 * kind of objects.
 * @constructor
 * @param {String} name
 * @param {Boolean} bUni Was a unicode literal?
 * @return {CfgParser.Literal}
 */
CfgParser.Literal = function(name, bUni){
	//Test.assert(typeof name == 'string', "Literal: constructor argument should be a string");
	this.value = name; 
	this.bUni = bUni;
};
/**
 * @return {String}
 */
CfgParser.Literal.prototype.toString = function(){ 
	return "Literal["+this.value+"]"; 
};
/**
 * Convert the literal to an html string. The bUni flag determines whether
 * the string represents a unicode or string literal.
 * @param {int} depth
 * @return {String}
 */
CfgParser.Literal.prototype.myString = function(depth){
	depth = depth || 0;
	var s = "";
	if (this.value) {
		if (typeof this.value == 'string') {
			if (this.bUni) {
				//Test.assert(typeof this.value == 'string', "Literal: this.value should be a string");
				var n = this.value.charCodeAt(0);
				n = n.toString(16);
				while (n.length < 4) n = '0'+n;
				s = '<span style="color:#ccc;">\'</span><span style="color:red;">'+n.toUpperCase()+'</span><span style="color:#ccc;">\'</span>';
			}
			else s = '<span style="color:#ccc;">"</span><span style="color:red;">'+this.value+'</span><span style="color:#ccc;">"</span>';
		} else if (this.value.myString) {
			s = this.value.myString(depth+1);
		} else {
			s = this.value.toString();
		}
	} else s = '&lt;?L?&gt;';
	if (this.bColor) s = '<span style="color:red;">'+s+'</span>';
	return s;
};
/**
 * Always returns "Literal"
 * @return {String}
 */
CfgParser.Literal.prototype.type = function(){ return 'Literal'; };

/**
 * An exception checks the previous match and causes a reject if
 * the previous match also matches this production. In the cfg it
 * is the e{...} syntax.
 * @param {CfgParser.Production} production 
 */
CfgParser.Exception = function(production){ 
	this.value = production;
};
/**
 * @return {String}
 */
CfgParser.Exception.prototype.toString = function(){ 
	return "Exception["+this.value+"]"; 
};
/**
 * Convert the exception to an html string.
 * @param {int} depth
 * @return {String}
 */
CfgParser.Exception.prototype.myString = function(depth){
	return "except{"+this.value.myString(depth+1, true)+"}";
};
/**
 * Always returns "Literal"
 * @return {String}
 */
CfgParser.Exception.prototype.type = function(){ return 'Exception'; };

/**
 * Match any of the parts of the first rule. Where a rule must normally be matched
 * entirely, for this production it is enough to match just one part of it.
 * @constructor
 * @param {CfgParser.Production} production
 * @return {CfgParser.Any}
 */
CfgParser.Any = function(production){ 
	this.value = production; 
};
/**
 * @return {String}
 */
CfgParser.Any.prototype.toString = function(){ 
	return "Any["+this.value+"]";
};
/**
 * Convert the any to an html string.
 * @param {int} depth
 * @return {String}
 */
CfgParser.Any.prototype.myString = function(depth){
	return "any{"+this.value.myString(depth+1, true)+"}";
};
/**
 * Always returns "Any"
 * @return {String}
 */
CfgParser.Any.prototype.type = function(){ return 'Any'; };
/**
 * Convert this production to a new production where every part of the
 * first rule is wrapped in its own rule. Makes generic parsing easier.
 * The returned production is anonymous.
 * @return {CfgParser.Production}
 */
CfgParser.Any.prototype.getRules = function(){
	// value = production, one rule, all the values
	// convert to a new production with each element as an element in a rule
	return this.value.value[0].value.map(function(o){ return new CfgParser.Rule([o]); });
};

/**
 * This is a look ahead production. The next token must not match
 * this production or else parsing fails.
 * @constructor
 * @param {CfgParser.Production} production
 * @return {CfgParser.Not}
 */
CfgParser.Not = function(production){ 
	this.value = production; 
};
/**
 * @return {String}
 */
CfgParser.Not.prototype.toString = function(){ 
	return "Not["+this.value+"]"; 
};
/**
 * Convert the not to an html string.
 * @param {int} depth
 * @return {String}
 */
CfgParser.Not.prototype.myString = function(depth){
	return "no{"+this.value.myString(depth+1, true)+"}here";
};
/**
 * Always returns "Not"
 * @return {String}
 */
CfgParser.Not.prototype.type = function(){ return 'Not'; };

/**
 * If this production does not matches, the search does not fail.
 * @constructor
 * @param {CfgParser.Production} production
 * @return {CfgParser.Optional}
 */
CfgParser.Optional = function(p){ 
	this.value = p; 
};
/**
 * @return {String}
 */
CfgParser.Optional.prototype.toString = function(){ 
	return "Optional["+this.value+"]"; 
};
/**
 * Convert the optional to an html string.
 * @param {int} depth
 * @return {String}
 */
CfgParser.Optional.prototype.myString = function(depth){
	return "optional{"+this.value.myString(depth+1, true)+"}";
};
/**
 * Always returns "Optional"
 * @return {String}
 */
CfgParser.Optional.prototype.type = function(){ return 'Optional'; };

/**
 * Throw an error on b0rk...
 * @param {mixed} message
 * @throws string
 */
CfgParser.prototype.throwError = function(message){
	var len = this.pos >= 10 ? 10 : this.pos;
	var at = (len - this.source.lastIndexOf('\n', this.pos));
	var prefix = this.source.substr(this.pos - len, len);
	var postfix = this.source.substr(this.pos, 10);
	throw "("+message+") Custom parser error: line "+this.line+":"+at+", pos "+this.pos+":\n"+prefix+"<HERE>"+postfix+"...";
};
/**
 * Parse one element (part of a rule)
 * The element is put in a global (to this context) array
 * @param {Array} ruleElements The array to contain all parts for current rule
 * @param {Array} elements The global elements array
 * @param {Array} used The global array to check which elements have been parsed as productions
 * @param {Array} used The global array to check which elements have not yet been parsed as productionss
 */
CfgParser.prototype.parseElement = function(ruleElements, elements, used, unused){
	var 
		buffer = '', 
		chr,
		last,
		p;
	while (this.pos < this.len) {
		if (last === this.pos) this.throwError("CfgParser.prototype.parseElement");
		last = this.pos;
		
		chr = this.source[this.pos];
		
		if (chr == '\\') {
			++this.pos;
		} else {
			if (chr == ' ' || chr == '\t') {
				++this.pos;
				break;
			}
			if (chr == '#') { // skip comment to end of line, let it fall through to next if
				while (this.pos < this.len && !CfgParser.isReturn(this.source[this.pos])) ++this.pos;
				if (this.pos > this.len) break;
				chr = this.source[this.pos];
			}
			if (chr == '$') { // skip section mark to end of line and use first word as token for collection
				this.parseSection();
				if (this.pos > this.len) break;
				chr = this.source[this.pos];
			}
			if (CfgParser.isReturn(chr) || chr == '}' || chr == ':') {
				if (CfgParser.isReturn(chr)) ++this.line;
				break;
			}
	
			if (chr == '"' || chr == "'") break;
	
			// start parsing special production
			if (this.source[this.pos+1] == '{') {
				p = false;
				if (chr == 'e') p = this.parseException();
				if (chr == 'o') p = this.parseOptional();
				if (chr == 'a') p = this.parseAny();
				if (chr == 'n') p = this.parseNot();
				if (p) {
					ruleElements.push(p);
					return;
				}
			}
		}
		
		buffer += chr;
		++this.pos;
	}
	
	if (buffer) {
		// production not yet used?
		if (buffer in unused) delete unused[buffer];
		// mark as used
		used[buffer] = true;
		
		// element already exist?
		if (buffer in ruleElements) ruleElements.push(elements[buffer]);
		else ruleElements.push(new CfgParser.Element(buffer, undefined, elements));
	}
};
/**
 * Parse a rule from a production. A rule has several parts called Element. These
 * are collected into an array and saved as a Rule object.
 * @param {Array} rules The current set of rules for the parent production
 */
CfgParser.prototype.parseRule = function(rules){
	var 
		ruleElements = [], 
		chr,
		last,
		literal;
	while (this.pos < this.len) {
		if (last === this.pos) this.throwError("CfgParser.prototype.parseRule");
		last = this.pos;

		chr = this.source[this.pos];
		if (chr == ':') break;
		if (CfgParser.isReturn(chr)) break;
		if (chr == '}') break;
		
		if (chr == '"') {
			++this.pos;
			literal = this.parseLiteral();
			if (literal) ruleElements.push(literal);
		} else if (chr == "'") {
			++this.pos;
			literal = this.parseUnicode();
			if (literal) ruleElements.push(literal);
		} else {
			this.parseElement(ruleElements, this.elements, this.used, this.unused);
		}
	}
	if (ruleElements.length) rules.push(new CfgParser.Rule(ruleElements));
};
/**
 * Parse one section. Sections are devided by lines starting with a
 * dollar sign ($). The first word is used as the token, the rest 
 * as a generic comment.
 * The sections are saved in the (contextual) global sections.
 * All productions are also grouped by section.
 */
CfgParser.prototype.parseSection = function(){
	var 
		key = '', 
		header = '',
		chr;

	++this.pos; // $
	
	while (this.pos < this.len && CfgParser.isWhite(this.source[this.pos])) ++this.pos; // skip whitespace
	
	chr = this.source[this.pos];
	while (this.pos < this.len && !CfgParser.isReturn(chr)) {
		chr = this.source[this.pos];
		if (!CfgParser.isReturn(chr)) header += chr;
		// if any kind of whitespace, move cursor to end of line (ignoring the rest for key, but not for header)
		if (CfgParser.isWhite(chr)) {
			while (this.pos < this.len && !CfgParser.isReturn(this.source[this.pos])) header += this.source[this.pos++];
		} else {
			// otherwise add current char to key for new section
			key += chr;
			
			++this.pos;
		}
	}
	
	++this.currentSection;
	this.keys[key] = this.currentSection;
	this.sections[this.currentSection] = [];
	this.orderedParts.push("<h1>"+header+"</h1>");
};
/**
 * Parse a production. Productions start with a single colon followed by
 * the name as a single token (white space in between is also ignored).
 * The rules for this production are to be put on a single line per rule.
 * All new productions are checked against the used and unused objects
 * and marked used in both. They are also put in several "buckets".
 * @param {Boolean} bNameless=false Anonymous productions don't actually parse the semi-colon or name
 * @return {CfgParser.Production}
 */
CfgParser.prototype.parseProduction = function(bNameless){
	var 
		rules = [], 
		chr,
		last,
		name,
		last;
	while (this.pos < this.len) {
		if (last === this.pos) this.throwError("CfgParser.prototype.parseProduction");
		last = this.pos;

		chr = this.source[this.pos];

		if (chr == '#') { // skip comment to end of line, let it fall through to next if
			while (this.pos < this.len && !CfgParser.isReturn(this.source[this.pos])) ++this.pos;
			if (this.pos > this.len) break;
			chr = this.source[this.pos];
		}
		
		if (chr == '$') { // parse a section
			this.parseSection();
			if (this.pos > this.len) break;
			chr = this.source[this.pos];
		}

		if (CfgParser.isReturn(chr)) {
			++this.line;
			++this.pos;
		} else if (CfgParser.isWhite(chr)) {
			++this.pos;
		} else if (chr == ':') {
			chr = this.source[++this.pos];
			// start parsing name
			name = '';
			last = undefined;
			while (this.pos < this.len) {
				if (last === this.pos) this.throwError("CfgParser.prototype.parseProduction2");
				last = this.pos;
				
				if (CfgParser.isWhite(chr)) {
					chr = this.source[++this.pos];
					if (name.length) break; // end of name
				} else {
					name += chr;
					chr = this.source[++this.pos];
				}
			}
			if (!name.length) {
				this.throwError("parseProduction:no name found");
			} else {
				break;
			}
		} else if (!bNameless) { // no colon
			this.throwError("parseProduction: no colon found");
		} else {
			break;
		}
	}

	last = false;
	while (this.pos < this.len) {
		if (last === this.pos) this.throwError("parseProduction3");
		last = this.pos;
		chr = this.source[this.pos];
		if (chr == '}') break; // end of special production
		this.parseRule(rules);
		if (this.source[this.pos] == '}') break; // end of special production
		if (this.source[this.pos] == ':') break; // next production starts now
		++this.pos;
	}
	var p = new CfgParser.Production(name, rules, this.elements);
	if (p && p.element && p.isNew) {
		p.element.n = this.elementCounter++;
		p.isNew = false;
	}
	
	return p;
};
/**
 * Parse a literal. This is a string or unicode character that
 * should occur literally and entirely in the input. This parser
 * supports two variants of literals. The double quotes signify
 * a string literal, much like in javascript. The single quotes
 * signify a unicode literal, which should always consist of
 * four hexadecimal characters, so without the backslash and u.
 * This function only parses the double quoted strings.
 * @return {CfgParser.Literal|false}
 */
CfgParser.prototype.parseLiteral = function(){
	var 
		buffer = '',
		last;
	while (this.pos < this.len) {
		if (last === this.pos) this.throwError("parseLiteral");
		last = this.pos;
		if (this.source[this.pos] == '"') {
			++this.pos;
			if (!buffer) buffer = "[empty]"; // temp
			break;
		}
		if (this.source[this.pos] == '\\') ++this.pos;
		buffer += this.source[this.pos];
		++this.pos;
	}
	if (buffer.length) return new CfgParser.Literal(buffer);
	return false;
};
/**
 * Parse a literal. This is a string or unicode character that
 * should occur literally and entirely in the input. This parser
 * supports two variants of literals. The double quotes signify
 * a string literal, much like in javascript. The single quotes
 * signify a unicode literal, which should always consist of
 * four hexadecimal characters, so without the backslash and u.
 * This function only parses the double quoted strings.
 * @return {CfgParser.Literal}
 */
CfgParser.prototype.parseUnicode = function(){
	if (this.pos+4 >= this.source.length) this.throwError("Unexpected end of input");
	if (this.source[this.pos+4] != "'") this.throwError("Invalid format, unclosed unicode literal");
	var uni = this.source.substr(this.pos, 4).toLowerCase();
	var n = parseInt(uni, 16);
	var c = String.fromCharCode(n);
	this.pos += 5;
	return new CfgParser.Literal(c, true); // true: unicode
};
/**
 * Parse an exception. The notation is e{element element ...}
 * Exceptions are parsed as a single Element, so they contribute
 * one element to the rule. An exception rejects a match if it 
 * matches the previous match: Identifier e{ReservedName}
 * @return {CfgParser.Exception}
 */
CfgParser.prototype.parseException = function(){
	this.pos += 2;
	var p = this.parseProduction(true); // no name
	if (this.source[this.pos] != '}') this.throwError("exception expected curly");
	++this.pos;
	return new CfgParser.Exception(p);
};
/**
 * Parse an any. The notation is a{element element ...}
 * Exceptions are parsed as a single Element, so they contribute
 * one element to the rule. An any rejects a match if none of the
 * sub elements matches: a{"0" "1" "2" "3"}
 * @return {CfgParser.Any}
 */
CfgParser.prototype.parseAny = function(){
	this.pos += 2;
	var p = this.parseProduction(true); // no name
	if (this.source[this.pos] != '}') this.throwError("any expected curly");
	++this.pos;
	return new CfgParser.Any(p);
};
/**
 * Parse a not. The notation is n{element element ...}
 * Any token is accepted except if it matches any of the
 * elements in the not body: "return" n{LineTerminator} Expression ";"
 * @return {CfgParser.Not}
 */
CfgParser.prototype.parseNot = function(){
	this.pos += 2;
	var p = this.parseProduction(true); // no name
	if (this.source[this.pos] != '}') this.throwError("not expected curly");
	++this.pos;
	return new CfgParser.Not(p);
};
/**
 * Parse an optional. The notation is o{element element ...}
 * This production is accepted regardless of whether it actually matched.
 * If it matches, the match is obviously used. Otherwise it is ignored.
 * Usage: "function" o{Identifier} "(" ...
 * @return {CfgParser.Optional}
 */
CfgParser.prototype.parseOptional = function(){
	this.pos += 2;
	var p = this.parseProduction(true); // no name
	if (this.source[this.pos] != '}') this.throwError("optional expected curly");
	++this.pos;
	return new CfgParser.Optional(p);
};

/**
 * This is the core parse function of the parser. It starts parsing the source
 * and stops when it finishes.
 */
CfgParser.prototype.parse = function(){
	this.currentSection = 0;
	this.keys = {}; // mapping: key => section
	this.pos = 0;
	this.line = 0;
	this.len = this.source.length;

	this.prods = [];
	this.used = {};
	this.unused = {};
	this.elements = {};
	this.cfgByName = {};
	this.orderedParts = [];
	this.sections = [[]];
	
	this.elementCounter = 0;
	
	var last;
	while (this.pos < this.len) {
		if (last === this.pos) this.throwError("main loop");
		last = this.pos;
		var p = this.parseProduction();

		if (p && p.name) {
			// track unused production definitions
			if (!(p.name in this.used)) this.unused[p.name] = true;
			this.prods.push(p);
			if (p.name in this.cfgByName && this.cfgByName[p.name].production) {
				if (window.debug) debug("Double: "+p.name);
			} else {
				this.cfgByName[p.name] = p;
			}
			
			this.orderedParts.push(p);
			this.sections[this.currentSection].push(p);
		}
	}
};

/**
 * Get a parsed cfg as html.
 * @return {String:html}
 */
CfgParser.prototype.toParsedString = function(){
	if (window.debug) {
		debug("Unused:");
		for (var key in this.unused) debug(key);
	}
	
	var arr = [];
	for (var i=0; i < this.orderedParts.length; ++i) {
		if (typeof this.orderedParts[i] == 'string') arr.push(this.orderedParts[i]);
		else arr.push(this.orderedParts[i].myString());
	}
	
	
	
	return "<pre>"+arr.join('')+"</pre>";
};

/**
 * Only show a particular section group of productions
 * @param {String} key
 * @return {String:html}
 */
CfgParser.prototype.showSection = function(key){
	var arr = [];
	for (var i=0, n=this.sections[this.keys[key]].length; i<n; ++i) {
		arr.push(this.sections[this.keys[key]][i].myString());
	}
	return "<pre>"+arr.join('')+"</pre>";
};

/**
 * Oh a simple test
 */
CfgParser.test = function(){
	var cfg = new CfgParser('cfg', true, true);
	var e = document.createElement('div');
	e.innerHTML = cfg.toParsedString();
	document.getElementById(e);
};
