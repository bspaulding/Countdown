var CD = Ember.Application.create({
  ready: function() {
    this._super();
    CD.EventsController.loadEvents();
  }
});

CD.Event = Ember.Object.extend({
  name: null,
  timestamp: null,
  timespan: null,
  timespanTimerId: null,

  timestampString: function(key, value) {
    if ( arguments.length > 1 ) { // Setter
      this.set('timestamp', new Date(value));
    }

    return '';
  }.property('timestamp'),

  days: function() {
    var span = this.get('timespan');
    if ( span ) { return span.days; }

    return '';
  }.property('timespan'),

  timestampChanged: function() {
    var callback = function(ts) {
      this.set('timespan', ts);
    }.bind(this);

    var timespanTimerId = this.get('timespanTimerId');
    if ( timespanTimerId ) {
      window.clearTimeout(timespanTimerId);
    }
    this.set('timespanTimerId', countdown(callback, this.get('timestamp'), countdown.DAYS));
  }.observes('timestamp'),

  date: function(key, value) {
    if ( arguments.length > 1 ) { // setter
      var newDate = new Date(value);
      if ( !isNaN(newDate.getTime()) ) {
        this.set('timestamp', newDate);
      }
    }

    var date = this.get('timestamp');
    if ( !date ) { return ''; }

    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var monthName = monthNames[date.getMonth()];

    return monthName + ' ' + date.getDate() + ', ' + date.getFullYear();
  }.property('timestamp'),

  asJSON: function() {
    return {
      name: this.get('name'),
      timestampString: this.get('timestamp')
    };
  },

  isActive: function() {
    return CD.EventsController.indexOf(this) === CD.EventsController.get('currentIndex');
  }.property('CD.EventsController.currentIndex', 'CD.EventsController.content')
});

CD.EventsController = Ember.ArrayProxy.create({
  content: [],

  loadEvents: function() {
    if ( !window.localStorage ) { return; }

    var eventsJSON = window.localStorage.getItem('events');
    if ( !eventsJSON ) { return; }

    var rawEvents = JSON.parse(eventsJSON);
    var events = [];
    for ( var i = 0; i < rawEvents.length; i += 1 ) {
      var event = CD.Event.create();
      for ( var key in rawEvents[i] ) {
        event.set(key, rawEvents[i][key]);
      }
      events.push(event);
    }

    this.addObjects(events);
  },

  json: function() {
    var collection = [];
    var content = this.get('content');
    for ( var i = 0; i < content.length; i += 1 ) {
      collection.push(content[i].asJSON());
    }

    return JSON.stringify(collection);
  }.property('content', 'content.@each.name', 'content.@each.timestamp'),

  jsonChanged: function() {
    if ( !window.localStorage ) { return; }

    window.localStorage.setItem('events', CD.EventsController.get('json'))
  }.observes('json'),

  addEvent: function() {
    var event = CD.Event.create({ name: 'Untitled Event' });
    event.set('timestamp', (new Date('July 30, 2012')));
    this.addObject(event);
    this.set('currentIndex', this.indexOf(event));
  },

  removeEvent: function() {
    this.removeObject(this.objectAt(this.get('currentIndex')));
  },

  currentIndex: null
});

CD.EventView = Ember.View.extend({
  templateName: 'event-view'
});

CD.PageView = Ember.View.extend({
  templateName: 'page-view',
  classNames: ['page-view'],
  content: [],
  itemViewClass: Ember.View,

  outerWidth: null,
  listStyle: function() {
    return 'width: ' + this.get('outerWidth') * this.get('content').length + 'px;';
  }.property('outerWidth', 'content.length'),
  listStyleChanged: function() {
    this.$('ul.pages').attr('style', this.get('listStyle'));
  }.observes('listStyle'),

  listItemStyle: function() {
    return 'width: ' + this.get('outerWidth') + 'px;';
  }.property('outerWidth'),
  listItemStyleChanged: function() {
    this.$('ul.pages li').attr('style', this.get('listItemStyle'));
  }.observes('listItemStyle'),

  contentChanged: function() {
    this.listItemStyleChanged();
  }.observes('content', 'content.length'),

  currentIndex: null,

  didInsertElement: function() {
    this.set('currentIndex', 0);
    window.addEventListener('resize', function(event) { this.updateFrame(event); }.bind(this));

    this.$('ul.pages')[0].addEventListener('DOMNodeInserted', function() {
      this.listItemStyleChanged();
    }.bind(this));

    addSwipeListener(this.$()[0], function(event) {
      if ( event.direction === 'left' ) {
        this.nextEvent();
      } else {
        this.previousEvent();
      }
    }.bind(this));

    this.updateFrame();
  },

  updateFrame: function(event) {
    this.set('outerWidth', window.outerWidth);
  },

  previousEvent: function() {
    var nextIndex = this.get('currentIndex') - 1;
    if ( nextIndex < 0 ) {
      return;
    }
    this.set('currentIndex', nextIndex);
  },

  nextEvent: function() {
    var nextIndex = this.get('currentIndex') + 1;
    if ( nextIndex == this.get('content').length ) {
      return;
    }
    this.set('currentIndex', nextIndex);
  },

  currentIndexChanged: function() {
    this.$('ul.pages').css('-webkit-transform', 'translate3d(-' + this.get('outerWidth') * this.get('currentIndex') + 'px, 0px, 0px)');
  }.observes('currentIndex')
});

CD.EditableTag = Ember.View.extend({
  template: Ember.Handlebars.compile("{{value}}"),
  attributeBindings: ['contenteditable'],
  contenteditable: 'true',
  content: null,
  key: null,
  value: function() {
    return this.get('content').get(this.get('key'));
  }.property('content', 'key'),

  keyUp: function() {
    this.get('content').set(this.get('key'), this.$()[0].textContent);
  }
});

CD.ControlButton = Ember.View.extend(Ember.TargetActionSupport, {
  tagName: 'li',
  click: function() { this.triggerAction(); }
})