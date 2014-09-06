/********************************************************
                       Natural Tools
 ********************************************************
 *  Tools for processing natural language.
 **/
var Language = {
  /**
   *  Only Latin support for now.
   *    NOTE: Anything wrapped in '{{}}' needs extra attention; i.e.
   *          in the template value "'" is wrapped with '{{\}}' and
   *          needs to be removed. 
   **/
  punctuation: {
    litteral: {
      pauses:      /<\,\>\/\;\:\'\"\|\\\}\]\{\[\=\+\_\-\)\(\*\&\^\%\$\#\@\~\`\–/,
      template:    [ '< , > . / ? ; : {{\'}} " | \ } ] { [ = + _ - ) ',
                     '( * & ^ % $ # @ ! ~ ` – [{{SPACE}}]' ].join(''),
      fullstops:   /.\?\;\:\!/,
      all:         /<\,\>\.\/\?\;\:\'\"\|\\\}\]\{\[\=\+\_\-\)\(\*\&\^\%\$\#\@\!\~\`\–[ ]/,
    },
    table: {
      all: /[\u0020-\u002F]||[\u003A-\u0040]||[\u005B-\u0060]||[\u007B-\u007E]/ //!working
    }
    //http://en.wikipedia.org/wiki/General_Punctuation_%28Unicode_block%29
    //[\u2000-\u206F]
  },
  digits: {
    table: {
      all: /[\u0030-\u0039]/
    }
  },
  alphabet: {
    table: {
      uppercase: {
        all: /[\u0041-\u005A]/
      },
      lowercase: {
        all: /[\u0061-\u007A]/
      }
    }
  },
  controls: {
    table: {
      all: /[\u0000-\u001F]||[\u007F]/
    }
  }
};

var CharSets = {
  /**
   * Controls, Basic Latin & Latin-1 Supplement
   **/
  latin:  /[\u000-\u007F]||[\u0080-\u00FF]/,
  greek:  /[\u0370-\u03FF]/,
  coptic: /[\u0370-\u03FF]/,
  /**
   * Cyrillic, Cyrillic Supplement & Cyrillic Extended-A
   * http://en.wikipedia.org/wiki/Cyrillic_script
   **/
  cyrillic: /[\u0400-\u04FF]||[\u0500-\u052F]||[\u2DE0-\u2DFF]/
    
  /**
   * Unicode
   *  Languages
   *    Armenian
   *      [\u0530-\u058F]
   *    Hebrew
   *      [\u0590-\u05FF]
   *    Arabic
   *      [\u0600-\u06FF]
   *    Syriac
   *      [\u0700-\u074F]
   *    Arabic Supplement
   *      [\u0750-\u077F]
   *    Thaana
   *      [\u0780-\u07BF]
   *    N'Ko
   *      [\u07C0-\u07FF]
   *    Samaritan
   *      [\u0800-\u083F]
   *    Mandaic
   *      [\u0840-\u085F]
   *    Arabic Extended-A
   *      [\u08A0-\u08FF]
   *    Thai
   *      [\u0E00-\u0E7F]
   *    Lao
   *      [\u0E80-\u0EFF]
   *    Tibetan
   *      [\u0F00-\u0FFF]
   *    Myanmar
   *      [\u1000-\u109F]
   *    Georgian
   *      [\u10A0-\u10FF]
   *    Hangul Jamo
   *      [\u1100-\u11FF]
   *    Ethiopic
   *      [\u1200-\u137F]
   *    Ethiopic Supplement
   *      [\u1380-\u139F]
   *    Cherokee
   *      [\u13A0-\u13FF]
   *    Unified Canadian Aboriginal Syllabics
   *      [\u1400-\u167F]
   *
   **
   *  Symbols
   *    General Punctuation
   *      [\u2000-\u206F]
   *    Superscripts and Subscripts
   *      [\u2070-\u209F]
   *    Currency Symbols
   *      [\u20A0-\u20CF]
   *    Combining Diacritical Marks for Symbols
   *      [\u20D0-\u20FF]
   *    Letterlike Symbols
   *      [\u2100-\u214F]
   *    Number Forms
   *      [\u2150-\u218F]
   *    Arrows
   *      [\u2190-\u21FF]
   *    Mathematical Operators
   *      [\u2200-\u22FF]
   *    Miscellaneous Technical
   *      [\u2300-\u23FF]
   *    Control Pictures
   *      [\u2400-\u243F]
   *    Optical Character Recognition
   *      [\u2440-\u245F]
   *    Enclosed Alphanumerics
   *      [\u2460-\u24FF]
   *    Box Drawing
   *      [\u2500-\u257F]
   *    Block Elements
   *      [\u2580-\u259F]
   *    Geometric Shapes
   *      [\u25A0-\u25FF]
   *    Miscellaneous Symbols
   *      [\u2600-\u26FF]
   *    Dingbats
   *      [\u2700-\u27BF]
   *    Miscellaneous Mathematical Symbols-A
   *      [\u27C0-\u27EF]
   *    Supplemental Arrows-A
   *      [\u27F0-\u27FF]
   *    Braille Patterns
   *      [\u2800-\u28FF]
   *    Supplemental Arrows-B
   *      [\u2900-\u297F]
   *    Miscellaneous Mathematical Symbols-B
   *      [\u2980-\u29FF]
   *    Supplemental Mathematical Operators
   *      [\u2A00-\u2AFF]
   *    Miscellaneous Symbols and Arrows
   *      [\u2B00-\u2BFF]
   *
   **
   * Misc.
   *    Specials
   *      (FFF0–FFFF)
   *    Supplemental Punctuation
   *      [\u2E00-\u2E7F]
   *
   **
   * Example
   *   new RegExp('\u0023').test('#');
   *   /[\u2603]/.test('☃')
   *   /[\u2603]/.test('☃')
   *   /[\u0400-\u04FF]/.test('Ѻ') // Checking for Crylic
   *
   **
   * Links
   *  http://en.wikipedia.org/wiki/Plane_%28Unicode%29#Basic_Multilingual_Plane
   *  http://en.wikipedia.org/wiki/C0_Controls_and_Basic_Latin
   **/

};
var Controls = {
  /**
   * Control Characters
   *
   *   Links
   *    http://en.wikipedia.org/wiki/Unit_separator
   *    http://en.wikipedia.org/wiki/C0_Controls_and_Basic_Latin
   *
   * FIXME
   *  ...
   *   name: {
   *     symbol: '',
   *     code:   '\uCODE'
   *   }
   *  };
   **/
  all: /\u0000-\u001F/,
  tab:                    '␉',    // [\u0009]    \t
  null:                   '␀',    // [\u0000]
  bell:                   '␇',    // [\u0007]
  space:                  '␠',    // [\u0020]    ' '
  cancel:                 '␘',    // [\u0018]
  Escape:                 '␛',    // [\u001B]
  shiftin:                '␏',    // [\u000F]
  enquiry:                '␅',    // [\u0005]
  newline:                '␊',    // [\u000A]    \n
  linetab:                '␋',    // [\u000B]
  linefeed:               '␊',    // [\u000A]    \n
  formfeed:               '␌',    // [\u000C]
  shiftout:               '␎',    // [\u000E]
  endoftext:              '␃',    // [\u0003]
  backspace:              '␈',    // [\u0008]
  substitute:             '␚',    // [\u001A]
  endofmedium:            '␙',    // [\u0019]
  acknowledge:            '␆',    // [\u0006]
  startoftext:            '␂',    // [\u0002]
  verticaltab:            '␋',    // [\u000B]
  horizontaltab:          '␉',    // [\u0009]    \t
  unitseparator:          '␟',    // [\u001F]
  fileseparator:          '␜',    // [\u001C]
  carriagereturn:         '␍',    // [\u000D]    \r
  groupseparator:         '␝',    // [\u001D]
  datalinkescape:         '␐',    // [\u0010]
  startofheading:         '␁',    // [\u0001]
  synchronousidle:        '␖',    // [\u0016]
  recordSeparator:        '␞',    // [\u001E]
  devicecontrolone:       '␑',    // [\u0011]    (XON)
  devicecontroltwo:       '␒',    // [\u0012]
  devicecontrolfour:      '␔',    // [\u0014]
  endoftransmission:      '␄',    // [\u0004]
  devicecontrolthree:     '␓',    // [\u0013]    (XOFF)
  negativeacknowledge:    '␕',    // [\u0015]
  endoftransmissionblock: '␗',    // [\u0017]
};

  //var cryllic = /абвгдеёжзийклмнопрстуфхцчшщъыьэюяабвгдеёжзийклмнопрстуфхцчшщъыьэюя/;
  
/*
http://www.fileformat.info/info/unicode/category/Po/list.htm
var results = new Array(),
    rows = document.getElementsByTagName('tbody')[1].children;

for( var x = 0; x < rows.length; x++) {
  var row = rows[x]
      code = row.children[0].children[0].innerHTML;
  code = '(' + code.replace('U+', '\\u') + ')';
  if( code.length > 8 ) break;
  results.push( code );
}
console.log( { here: '[' + results.join('||') + ']' } )

----
http://jrgraphix.net/research/unicode_blocks.php


*/
