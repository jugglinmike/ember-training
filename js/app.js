(function() {
"use strict";

var endpoint = 'http://ember-training.nodejitsu.com/';
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
    // Create a deferred to track the status of the AJAX requests. This is
    // necessary because jQuery deferreds do not chain properly with other
    // deferred libraries (including RSVP)
    var promise = new Ember.RSVP.Promise();
    $.getJSON(endpoint + 'albums')
      .then(function(albums) {
        var albumReqs = albums.map(function(album) {
          var songReqs = album.songs.map(function(songID) {
            var songReq =  $.getJSON(endpoint + 'songs/' + songID);

            songReq.then(function(song) {
              song.album = album;
            });

            return songReq;
          });

          Ember.RSVP.all(songReqs).then(function(songs) {
            songs.sort(function(a, b) {
              return a.track > b.track;
            });
            album.songs = songs;
          });

          return Ember.RSVP.all(songReqs);
        });

        Ember.RSVP.all(albumReqs).then(promise.resolve.bind(promise, albums),
          promise.reject.bind(promise));
      }, promise.reject.bind(promise));

    return promise.then(null, function(reason) {
      console.error('Failed to load library information from network. ' +
        'Using local data.');
      return App.ALBUM_FIXTURES;
    });
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
