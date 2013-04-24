(function() {
"use strict";

window.App = Ember.Application.create();

App.Router.map(function() {
  this.resource('album', {
    path: 'album/:album_id'
  });
});

App.ApplicationRoute = Ember.Route.extend({
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return App.ALBUM_FIXTURES;
  }
});

App.AlbumRoute = Ember.Route.extend({
  model: function(params) {
    return App.ALBUM_FIXTURES.findProperty('id', params.album_id);
  },
  events: {
    play: function(song) {
      this.controllerFor("nowPlaying").set("model", song);
    }
  }
});
App.AlbumController = Ember.ObjectController.extend({
  totalDuration: function() {
    var duration = 0;
    var songs = this.get('songs');
    var idx, len;

    for (idx = 0, len = songs.length; idx < len; ++idx) {
      duration += songs[idx].duration;
    }

    return duration;
  }.property('songs.@each.duration')
});

App.NowPlayingController = Ember.ObjectController.extend({
});

App.AudioView = Ember.View.extend({
  classNames: ['audio-control'],
  templateName: 'audioControl',
  play: function() {
    this.$('audio')[0].play();

    // TODO: Update tests to acknowledge that setting playback state is an
    // asynchronous operation, then remove this line.
    this.set('isPlaying', true);
  },
  pause: function() {
    this.$('audio')[0].pause();

    // TODO: Update tests to acknowledge that setting playback state is an
    // asynchronous operation, then remove this line.
    this.set('isPlaying', false);
  },
  didInsertElement: function() {
    var view = this;
    var $audio = this.$('audio');

    $audio.prop('autoplay', true)
      .attr('src', this.get('song.url'));

    $audio.on('canplaythrough', function() {
      view.set('isLoaded', true);
    }).on('loadedmetadata', function() {
      view.set('duration', Math.floor(this.duration));
    }).on('timeupdate', function() {
      view.set('currentTime', Math.floor(this.currentTime));
    }).on('playing', function() {
      view.set('isPlaying', true);
    }).on('pause', function() {
      view.set('isPlaying', false);
    });
  },
  src: function(attr, val) {
    if (arguments.length === 2) {
      this.$('audio').attr('src', val);
      return val;
    }
    return $('audio').attr('src');
  }.property(),
  currentTime: function() {
    return this.$('audio')[0].currentTime;
  }.property()
});

Ember.Handlebars.helper('audio', App.AudioView);

Ember.Handlebars.helper("format-duration", function(duration) {
  var seconds = duration % 60;
  var minutes = (duration-seconds) / 60;
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
});

})();
