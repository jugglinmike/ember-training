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
  }
});

Ember.Handlebars.helper("format-duration", function(duration) {
  var seconds = duration % 60;
  var minutes = (duration-seconds) / 60;
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
});

})();
