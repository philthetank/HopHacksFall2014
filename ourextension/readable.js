(function () {

    _readableOptions = {
        'text_font': 'quote(Palatino Linotype), Palatino, quote(Book Antigua), Georgia, serif',
            'text_font_monospace': 'quote(Courier New), Courier, monospace',
            'text_font_header': 'quote(Times New Roman), Times, serif',
            'text_size': '18px',
            'text_line_height': '1.5',
            'box_width': '30em',
            'color_text': '#282828',
            'color_background': '#F5F5F5',
            'color_links': '#0000FF',
            'text_align': 'normal',
            'base': 'blueprint',
            'custom_css': ''
    };
    
    if (document.getElementsByTagName('body').length > 0);
    else {
        return;
    }
    
    if (window.$readable) {
        if (window.$readable.bookmarkletTimer) {
            return;
        }
    } else {
        window.$readable = {};
    }
    window.$readable.bookmarkletTimer = true;
    window.$readable.options = _readableOptions;
    
    if (window.$readable.bookmarkletClicked) {
        window.$readable.bookmarkletClicked();
        return;
    }
    _readableScript = document.createElement('script');
    _readableScript.setAttribute('src', 'http://readable-static.tastefulwords.com/target.js?rand=' + encodeURIComponent(Math.random()));
    document.getElementsByTagName('body')[0].appendChild(_readableScript);
})();