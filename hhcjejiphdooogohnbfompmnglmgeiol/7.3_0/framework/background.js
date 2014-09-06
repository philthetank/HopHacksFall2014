/**
 * Logging Symbols
 **
 * ☢    ☠    ⚠
 * ⚐    ⚑
 * ✔    ✘
 * ☹    ☺
 * ⌨
 * ⌛
 */

/* Maintain backwards compatibility. */
if( localStorage.wordList || localStorage.wordlist || localStorage.filterList || localStorage.Filters )
  {
    console.log( '⚑ - Starting Filter Migration - ⚑' );
    console.log( '⌛ - Migrating filters...' );
    localStorage.filters = localStorage.wordList   || localStorage.wordlist ||
                           localStorage.filterList || localStorage.Filters;
    localStorage.wordList = localStorage.wordlist = localStorage.Filters = localStorage.filterList = '';
    console.log( '⚠ - This feature will be removed in upcoming versions...' );
    console.log( '⚐ - Filter Migration Complete - ⚐' );
    console.log( '******************************' );
  }
/* Remove in upcoming versions. */

/* Filters */
var Filters       = {},
    //FiltersUpdate = 0,
    FiltersHash   = 0;
function UpdateFilters( ) {
  //console.log('⚑ - Checking Filters - ⚑')
  
  /*
  function getMins( ms ) {
    return Math.round( ms / ( 1000 * 60 ) );
  };
  var Now  = new Date(),
      Then = getMins( Now.getTime() ) - getMins( FiltersUpdate );
  if( Then < 1 ) {
    return Filters;
  }
  */
  var LocalFilters = ( localStorage.filters !== undefined ? localStorage.filters : '{}' ),
      NewHash      = LocalFilters.Hash(),
      OldHash      = FiltersHash;
  //console.log( '⌛ - Loading filters...' );
  if( OldHash !== NewHash ) {
    //console.log('✘ - Filters need updating...');
    LocalFilters = JSON.parse( LocalFilters );
    var Keys   = Object.keys( LocalFilters ),
        Count  = ( Keys.length - 1 ) | 0,
        Result = [],
        x      = 0;
    for( Count; Count >= 0; Count-- ) {
      var key = Keys[ Count ];
      Result[ x++ ] = [
        key,
        '\\b' + key + '\\b',
        LocalFilters[ key ]
      ];
    }
    Filters       = Result;
    FiltersHash   = NewHash;
    //FiltersUpdate = Now.getTime();
  }
  //console.log('✔ - Awesome! Filters are up to date!');
  console.log( '⚐ - Filters Checked - ⚐' );
  //console.log( '******************************' );
  return Filters;
};
function Analyze_Filters( text, filters ) {
  //console.log('⚑ - Preprocessing Filters - ⚑')
  var text    = text.toLowerCase(),
      count   = ( filters.length - 1 ) | 0,
      matches = [];
  //console.log( '⌛ - Analyzing document text...' );
  for( count; count >= 0; count-- ) {
    var filter = filters[ count ];
    if( text.indexOf( filter[0] ) !== -1 ) matches.push( filter );//filters.splice( count, 1 );//
  }
  //console.log('✔ - We\'re done!');
  console.log( '⚐ - Filters Processed - ⚐' );
  //console.log( '******************************' );
  return matches;
};
String.prototype.Hash = function( ) {
  var len = ( this.length - 1 ) | 0;
      hash = 0;
  for( len; len >= 0; len-- ) {
    hash = ((hash << 5) - hash) + this.charCodeAt( len ) | 0;
  }
  return hash;
};
/* Filters */

/* Support */
function getSupport() {
  if( localStorage.support != undefined ) return localStorage.support;
  return true;
};
/* Support */

/* Background */
function Background( action, params ) {
  switch( action ) {
    case 'Debug':
      break;
    case 'Filters':
      return Analyze_Filters( params, UpdateFilters() );
      break;
    case 'State':
      //console.log( '⚑ - Checking State - ⚑' );
      var State = 1;
      function isBlacklisted( url ) {
        var blacklist = JSON.parse(
          (
            localStorage.blacklist === undefined ?
              '{}'
              :
              localStorage.blacklist
          )
        ),
            sites = Object.keys(blacklist),
            len   = ( sites.length - 1 ) | 0;
        blacklist["chrome-extension"] = 1;
        for( len; len >= 0 ; len-- ) {
          if( RegExp(sites[ len ], 'i').test(url) ) return true;
        }
        return false;
      };
      if( localStorage.state === 'false' ) State = 0;
      if( isBlacklisted( params ) ) State = 0;
      //console.log( '⌛ - Loading state...' );
      //if( State === 0 ) {
        //console.log('✘ - Extension is currently turned off..');
      //} else {
        //console.log('✔ - Congrats! The extension is currently on!');
      //}
      console.log( '⚐ - State Checked - ⚐' );
      //console.log( '******************************' );
      return State; break;
    default:
      break;
  }
};
/* Background */


UpdateFilters( );

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch( request[2] ) {
    case 'init':
      var State = 0;
      if( State = Background( 'State', request[0] ) ) {
        var Filters = Background( 'Filters', request[1] );
        if( Filters.length !== 0 ) {
          sendResponse( [ State,
                          Filters,
                          getSupport()
                        ] );
          return;
        }
      }
      sendResponse( { state:   0,
                      filters: 0,
                      support: 0
                    } );
    break;
  default:
    sendResponse( { data: 0 } );
    break
  }
});
