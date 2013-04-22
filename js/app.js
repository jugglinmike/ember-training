(function() {
"use strict";

window.App = Ember.Application.create();

App.Router.map(function() {
});

App.ApplicationRoute = Ember.Route.extend({
  model: function() {
    return App.ALBUM_FIXTURES;
  }
});

})();
