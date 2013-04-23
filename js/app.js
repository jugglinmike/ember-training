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
  templateName: 'audioControl'
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
