var Config = {
  filterLimit: 100,
  blacklistLimit: 10,
  get: function (property) {
    return this[property];
  }
};

var Pro = {
  download: function (event) {
    window.open("data:application/octet-stream," +
        encodeURIComponent(JSON.stringify(localStorage)),
        "WordFilterData"
      )
      .focus();
  }
};
/* Pro *************************************/
document.getElementById('download')
  .addEventListener("click", Pro.download);

var Blacklist = {
  save: function (event) {
    Settings.create('blacklist', [Elements.blackList.value, 1]);
    Elements.blackList.value = '';
    GUI.Banner.message("Success! Black List updated.", "green", 1500);
    GUI.build('blacklist');
    GUI.BlacklistSpace();
    GUI.BlacklistSpace();
  },
  clear: function () {
    document.getElementById('blackList')
      .value = '';
  },
  remove: function (event) {
    Settings.remove('blacklist', event.target.value);
    GUI.Banner.message("Item removed.", "yellow", 1500);
    GUI.build('blacklist');
    GUI.BlacklistSpace();
  }
};

var Settings = {
  status: function (property, state) {
    if (state) {
      localStorage[property] = state;
      return localStorage[property];
    } else {
      if (property) {
        if (!localStorage[property]) {
          localStorage[property] = true;
        }
        return localStorage[property];
      }
    }
    return false;
  },
  get: function (property) {
    if (!localStorage[property]) {
      localStorage[property] = '{}';
    }
    return JSON.parse(localStorage[property]);
  },
  create: function (property, value) {
    var temp = this.get(property);
    if (Object.keys(temp)
      .length < Config.filterLimit) {
      temp[value[0].toLowerCase()] = value[1];
      localStorage[property] = JSON.stringify(temp);
    }
  },
  remove: function (property, value) {
    var temp = this.get(property);
    delete temp[value];
    localStorage[property] = JSON.stringify(temp);
  },
  destroy: function (property) {
    localStorage[property] = '{}';
  }
};

var Console = {
  run: function (event) {
    var input = document.getElementById('consoleInput')
      .value,
      output = document.getElementById('consoleOutput'),
      command = input.match(/!\w*\s/gim)[0].trim();
    input = input.replace(command, '');
    if (!input) return;
    switch (command) {
    case "!add":
      output.innerHTML += "> Adding filters to storage...\n";
      console.log('add command ran');
      break;
    case "!purchase":
      output.innerHTML += "$ Adding purchases...\n";
      break;
    default:
      console.log(command)
      console.log(input)
    }
    Console.clear();
  },
  clear: function (event) {
    document.getElementById('consoleInput')
      .value = '';
  }
};

var Menu = {
  build: function (option) {
    var elements = ELEMENTS.get('display'),
      title = elements.title; //,
    display = elements.display,
      menu = document.getElementsByTagName('options')[0], //document.getElementById('menu'),
      fallback = function () {
        document.getElementById("optionsContent")
          .show();
        title.innerHTML = "Options";
        menu.children[0].select();
      };
    try {
      option = option.target.location.hash.substring(1)
        .toLowerCase();
    } catch (err) {
      fallback();
    }
    if (option) {
      for (var i = 0; i < menu.children.length; i++) {
        var child = menu.children[i],
          childContent = child.children[0].innerHTML.normalize();
        if (childContent != option) {
          child.unselect();
          display.children[i].hide();
        } else {
          child.select();
          display.children[i].show();
          title.innerHTML = option.capitalize( );
        }
      }
    } else {
      fallback();
    }
    //window.scroll(0,0);
  }
};

var State = {
  save: function (event) {
    if (event.target.id === "switchOff") {
      Settings.status('state', 'false');
    } else {
      Settings.status('state', 'true');
    }
    GUI.build('state');
  }
};

var Filters = {
  save: function (event) {
    if (Elements.from.value.length > 0) {
      Settings.create('filters', [Elements.from.value, Elements.to.value]);
      Elements.to.value = '';
      Elements.from.value = '';
      GUI.Banner.message("Success! Filters updated.", "green", 1500);
      GUI.build('filters');
      GUI.FilterSpace();
    }
  },
  clear: function () {
    Elements.to.value = '';
    Elements.from.value = '';
  },
  remove: function (event) {
    Settings.remove('filters', event.target.value);
    GUI.Banner.message("Filter removed.", "yellow", 1500);
    GUI.build('filters');
    GUI.FilterSpace();
  }
};

var Elements = {
  to: document.getElementById('to'),
  from: document.getElementById('from'),
  blackList: document.getElementById('blackList'),
  optionName: document.getElementById('optionName'),
  saveBlackList: document.getElementById('saveBlackList'),
  clearBlackList: document.getElementById('clearBlackList'),
  blacklistDisplay: document.getElementById('blacklistDisplay'),
};

var COMMON = {
  randomString: function (len) {
    len = len || 6;
    var text = new String();
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return text;
  }
};

var ELEMENTS = {
  display: {
    title: document.getElementsByTagName('selection')[0],
    display: document.getElementsByTagName('content')[0]
  },
  blacklist: {
    display: document.getElementById('blacklistDisplay')
  },
  filters: {
    display: document.getElementsByTagName('filters')[0]
  },
  ads: {
    on: document.getElementById('adsOn'),
    off: document.getElementById('adsOff')
  },
  state: {
    on: document.getElementById('switchOn'),
    off: document.getElementById('switchOff')
  },
  tooltips: {
    on: document.getElementById('tooltipsOn'),
    off: document.getElementById('tooltipsOff')
  },
  icon: {
    on: document.getElementById('iconOn'),
    off: document.getElementById('iconOff')
  },
  filterSpace: {
    used: document.getElementsByTagName('filterUsed'),
    total: document.getElementsByTagName('filterSpace')
  },
  blacklistSpace: {
    used: document.getElementsByTagName('blacklistUsed'),
    total: document.getElementsByTagName('blacklistSpace')
  },
  get: function (property) {
    return this[property] || false;
  }
};

var TEMPLATES = {
  blacklist: {
    list: ['<div class="item row">',
      '<div class="five-percent int">',
      '{{COUNTER}}.',
      '</div>',
      '<div class="ninety-five-percent outline">',
      '<div class="seventy-percent push-five-percent">',
      '<div class="row">',
      '<a href="#blacklist" class="from">{{KEY}}</a>',
      '</div>',
      '</div>',
      '<button id="{{ID}}" value="{{KEY}}" class="red push-five-percent twenty-percent">',
      'Delete',
      '</button>',
      '</div></div>'
    ].join('')
  },
  filters: {
    list: ['<div class="item row">',
      '<div class="five-percent int">',
      '{{COUNTER}}.',
      '</div>',
      '<div class="ninety-five-percent outline">',
      '<div class="seventy-percent push-five-percent">',
      '<div class="row">',
      //                 '<a href="#options!key={{KEY}}" class="from">{{KEY}}</a>',
      '<a href="#options" class="from">{{KEY}}</a>',
      ' / ',
      '<a href="#options" class="to">{{VALUE}}</a>',
      //                 '<a href="#options!key={{KEY}}" class="to">{{VALUE}}</a>',
      '</div>',
      '</div>',
      '<button id="{{ID}}" value="{{KEY}}" class="red push-five-percent twenty-percent">',
      'Delete',
      '</button>',
      '</div></div>'
    ].join('')
  },
  get: function (property) {
    return this[property];
  }
};

var CALLBACKS = {
  blacklist: Blacklist.remove,
  filters: Filters.remove,
  get: function (property) {
    return this[property];
  }
};

var GUI = {
  Modal: {
    modalElement: document.getElementById('modal'),
    build: function (title, content) {
      var titleElement = document.getElementById('title'),
        contentElement = document.getElementById('content');
      titleElement.innerHTML = title;
      contentElement.innerHTML = content;
    },
    hide: function () {
      document.getElementById('modal')
        .hide();
    }
  },
  Banner: {
    message: function (message, type, time) {
      time = time || 1500;
      var update = document.getElementsByTagName('message')[0];
      update.text(message);
      update.addClass(type)
      update.show();
      setTimeout(function () {
        update.removeClass(type);
        update.hide();
      }, time);
    }
  },
  FilterSpace: function () {
    var limit = Config.get('filterLimit'),
      values = Settings.get('filters'),
      inuse = Object.keys(values)
      .length,
      elements = ELEMENTS.get('filterSpace'),
      used = elements.used,
      total = elements.total;
    if (limit != "pro") {
      used[0].innerHTML = inuse;
      total[0].innerHTML = limit;
      used[1].innerHTML = inuse;
      total[1].innerHTML = limit;
      percentInUse = ((inuse / limit) * 100);
      if (percentInUse < 10) percentInUse = 10;
      document.getElementById('filtersUsed')
        .style.width = percentInUse + '%';
      document.getElementById('filtersAvaliable')
        .style.width = ((100 - percentInUse) - 6) + '%';
    }
  },
  BlacklistSpace: function () {
    var limit = Config.get('blacklistLimit'),
      values = Settings.get('blacklist'),
      inuse = Object.keys(values)
      .length,
      elements = ELEMENTS.get('blacklistSpace'),
      used = elements.used,
      total = elements.total;
    if (limit != "pro") {
      used[0].innerHTML = inuse;
      total[0].innerHTML = limit;
      percentInUse = ((inuse / limit) * 100);
      if (percentInUse < 10) percentInUse = 10;
      document.getElementById('blacklistUsed')
        .style.width = percentInUse + '%';
      document.getElementById('blacklistAvaliable')
        .style.width = ((100 - percentInUse) - 6) + '%';
    }
  },
  build: function (property) {
    if (property === "ads") {
      var state = Settings.status("support"),
        element = document.getElementById('ads');
      element.value = state;
      if (state === "true") {
        element.innerText = "Turn ads off?"
        element.addClass("red");
        element.removeClass("green");
      } else {
        element.innerText = "Turn ads on?";
        element.addClass("green");
        element.removeClass("red");
      }
      return;
    }
    if (property === "state" || property === "tooltips" || property === "icon") {
      var state = Settings.status(property),
        elements = ELEMENTS.get(property),
        on = elements.on,
        off = elements.off;
      if (state === "false") {
        off.enable();
        on.disable();
      } else {
        on.enable();
        off.disable();
      }
    } else {
      var elements = ELEMENTS.get(property),
        display = elements.display,
        template = TEMPLATES.get(property).list;
      values = Settings.get(property),
        keys = Object.keys(values),
        len = keys.length,
        listener = new Array(),
        temp = '';
      display.text('')
      if (len) {
        for (i = 0; i < len; i++) {
          var id = COMMON.randomString(),
            key = keys[i],
            value = values[key],
            row = template.replace(/{{ID}}/gim, id)
            .replace(/{{KEY}}/gim, key)
            .replace(/{{VALUE}}/gim, value)
            .replace(/{{COUNTER}}/gim, i + 1);
          temp += row;
          listener.push(id);
        }
        display.addText(temp);
        for (i = 0; i < listener.length; i++) {
          document.getElementById(listener[i])
            .addEventListener("click",
              CALLBACKS.get(property));
        }
      }
    }
  },
  Ads: {
    state: function (event) {
      if (this.value === "true") {
        this.value = "false";
        this.innerText = "Turn ads off?"
        Settings.status('support', 'false');
      } else {
        this.value = "true";
        this.innerText = "Turn ads on?"
        Settings.status('support', 'true');
      }
      GUI.build('ads');
    }
  },
  Blacklist: {
    counter: 0,
    destroy: function () {
      if (GUI.Blacklist.counter === 0) {
        var self = this,
          destroy = this.parentNode.children[2];
        self.hide();
        destroy.show();
        GUI.Blacklist.counter++;
        setTimeout(function () {
          destroy.hide();
          self.show();
          GUI.Blacklist.counter = 0;
        }, 5000);
      } else {
        if (GUI.Blacklist.counter === 1) {
          Settings.destroy('blacklist');
          this.hide()
          this.parentNode.children[1].show()
          GUI.Banner.message("Blacklist has been terminated.", "red", 1500);
          GUI.build('blacklist');
        }
        GUI.Blacklist.counter = 0;
      }
    }
  },
  Filters: {
    counter: 0,
    destroy: function () {
      if (GUI.Filters.counter === 0) {
        var self = this,
          destroy = this.parentNode.children[2];
        self.hide();
        destroy.show();
        GUI.Filters.counter++;
        setTimeout(function () {
          destroy.hide();
          self.show();
          GUI.Filters.counter = 0;
        }, 5000);
      } else {
        if (GUI.Filters.counter === 1) {
          Settings.destroy('filters');
          this.hide()
          this.parentNode.children[1].show()
          GUI.Banner.message("...and they're outta here!", "red", 1500);
          GUI.build('filters');
        }
        GUI.Filters.counter = 0;
      }
    }
  }
};

HTMLElement.prototype.text = function (text) {
  this.innerHTML = text;
}
HTMLElement.prototype.addText = function (text) {
  this.innerHTML += text;
}
HTMLElement.prototype.addClass = function (className) {
  if (!this.className.match(new RegExp(className, 'gim'))) {
    var classArray = this.className.split(' ');
    classArray[classArray.length] = className;
    this.className = classArray.join(' ').trim();
  }
}
HTMLElement.prototype.removeClass = function (className) {
  this.className = this.className.replace(
    new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'gim'),
    '');
}
HTMLElement.prototype.disable = function () {
  if (!this.className.match(/(?:^|\s)disabled(?!\S)/gim)) {
    var classArray = this.className.split(' ');
    classArray[classArray.length] = "disabled";
    this.className = classArray.join(' ').trim();
  }
}
HTMLElement.prototype.enable = function () {
  this.className = this.className.replace(/(?:^|\s)disabled(?!\S)/, '');
}
HTMLElement.prototype.select = function () {
  if (!this.className.match(/(?:^|\s)selected(?!\S)/gim)) {
    var classArray = this.className.split(' ');
    classArray[classArray.length] = "selected";
    this.className = classArray.join(' ').trim();
  }
}
HTMLElement.prototype.unselect = function () {
  this.className = this.className.replace(/(?:^|\s)selected(?!\S)/gim, '');
}
HTMLElement.prototype.show = function () {
  if (this.className.match(/(?:^|\s)hidden(?!\S)/gim)) {
    this.className = this.className.replace(/(?:^|\s)hidden(?!\S)/gim, '');
  }
}
HTMLElement.prototype.hide = function () {
  if (!this.className.match(/(?:^|\s)hidden(?!\S)/gim)) {
    var classArray = this.className.split(' ');
    classArray[classArray.length] = "hidden";
    this.className = classArray.join(' ').trim();
  }
}
String.prototype.normalize = function () {
  return this.toLowerCase()
             .replace(/\s/gim, '');
}
String.prototype.capitalize = function () {
  return this[0].toUpperCase() + this.slice(1);
}

function init() {
  GUI.build('state');
  GUI.build('ads');
  GUI.build('filters');
  GUI.build('blacklist');
  GUI.FilterSpace();
  GUI.BlacklistSpace();
  Menu.build(window.location.hash.substring(1));
  if( localStorage.wordList
   || localStorage.wordlist
   || localStorage.filterList
   || localStorage.Filters ) {
   // moveFilters();
  }
};

function moveFilters() {
  localStorage.filters = localStorage.wordList
                      || localStorage.wordlist
                      || localStorage.filterList
                      || localStorage.Filters;
  localStorage.wordList   =
  localStorage.wordlist   =
  localStorage.filterList = 
  localStorage.Filters    = '';
};
document.onload = init();

var timer = setInterval( function( ) {
  //init()
}, 10000);  


window.addEventListener("hashchange", Menu.build);

document.getElementById('switchOn')
  .addEventListener("click", State.save);
document.getElementById('switchOff')
  .addEventListener("click", State.save);
document.getElementById('saveFilter')
  .addEventListener("click", Filters.save);
//document.getElementById('clearFilter').addEventListener ("click", Filters.clear);
document.getElementById('saveBlackList')
  .addEventListener("click", Blacklist.save);
//document.getElementById('clearBlackList').addEventListener ("click", Blacklist.clear);

/* Advance *************************************/
/* Blacklist *********************************/
document.getElementById('warningBlacklist')
  .addEventListener("click", GUI.Blacklist.destroy);
document.getElementById('destroyBlacklist')
  .addEventListener("click", GUI.Blacklist.destroy);
/* Filters ***********************************/
document.getElementById('warningFilters')
  .addEventListener("click", GUI.Filters.destroy);
document.getElementById('destroyFilters')
  .addEventListener("click", GUI.Filters.destroy);
document.getElementById('ads')
  .addEventListener("click", GUI.Ads.state);

/* Modals *************************************/
document.getElementById('close')
  .addEventListener("click", GUI.Modal.hide);
