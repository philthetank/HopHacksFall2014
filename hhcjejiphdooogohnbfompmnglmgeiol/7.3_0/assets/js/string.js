String.prototype.normalize = function () {
  return this.toLowerCase()
         .replace(/\s/gim, '');
}

String.prototype.capitalize = function () {
  return this[0].toUpperCase() + this.slice(1);
}

String.prototype.isAllCaps = function() {
  return { result: this.toUpperCase() == new String(this),
           product: this.toUpperCase() };
}

String.prototype.isFirstCap = function() {
  var transform = this[0].toUpperCase() + this.slice(1).toLowerCase();
  return { result:  transform == new String(this),
           product: transform };
}

String.prototype.matchCapitalization = function( regex, replacement, method ) {
  var self        = this,
      len         = this.length,
      parts       = replacement.split(' '),
      regex       = new RegExp(regex),
      index       = -1,
      bound       = -1,
      i           = -1,
      foundParts  = new Array(),
      camelCase   = function( word ) {
        return word[0].toUpperCase() + word.toLowerCase().slice(1);
      };
  return this.replace( regex, function( found ) {
    // Determine a method to use...
    foundParts = found.split(' ');
    for( i = 0; i < foundParts.length; i++ ) {
      if( camelCase( foundParts[i] ) === foundParts[i] ) {
        foundParts["camelCase"] = true;
      } else {
        foundParts["inline"] = true;
      }
    }
    if( method === "camelCase"
        || !foundParts["inline"] && foundParts["camelCase"] && method !== "camelCase" ) {
      for( i = 0; i < parts.length; i++ ) {
        parts[i] = camelCase( parts[i] );
      }
      return parts.join(' ');
    }
    // If the string was not Camel Cased we move onto using
    // the inline capitilization method; i.e. Chemical forumals.
    replacement = replacement.split('')
    index = self.indexOf(found),
    bound = found.length; // Only do what we know, leave the rest as is...
    for( i = 0; i < bound; i++ ) {
      if(    !/\d/i.test( self[index] )     //Not a digit
          && !/\s/i.test( self[index] )     // Not a symbol
          && !/\W/i.test( self[index] ) ) { // Not white space
        if( foundChar.toLowerCase() == foundChar ) {
          replacement[i] = replacement[i].toLowerCase();
        } else {
          replacement[i] = replacement[i].toUpperCase();
        }
      }
      index++;
    }
    return replacement.join('');
  } );
}
String.prototype.matchCap = function( regex, replacement, method ) {
  //"This is OnLy a TEST".matchCap(/only/gim, "not");
  method = method || false;
  return this.matchCapitalization( regex, replacement, method )
}

String.prototype.profile = function( ) {
  var self        = this,
      len         = this.length,
      caps        = new Object();
  for( var i = 0; i < len; i++) {
    var currentChar = self[i];
    caps[i] = { char: currentChar,
                isLower: currentChar.toLowerCase() == currentChar,
                isNum: /\d/i.test( currentChar ),
                isWhiteSpace: /\s/i.test( currentChar ),
                isSymbol: /\W/i.test( currentChar ),
              };
  }
  return caps;
}
