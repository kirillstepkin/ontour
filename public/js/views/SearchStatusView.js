define(['marionette',
		'channel'
], function(Marionette, channel) {
	'use strict';

	return Marionette.ItemView.extend({
		
		el: '#status',

		tplNotFound: _.template('<h3>Not found</h3>'),

		tplLoaded: _.template('<h3>Loading <%= page * 10 %> of <%= total %></h3>'),

		tplFinished: _.template('<h3>Finished <%= total %> of <%= total %></h3>'),

		initialize: function() {
			channel.trigger('reset');

			this.listenTo(channel, 'getEvents', this.getEvents);

			// this.model.on('change', this.render, this);
		},

		render: function() {

			this.$el.show();

			if (this.model.get('page') < this.model.get('totalPages')) {
				this.$el.html(this.tplLoaded(this.model.toJSON()));
			} else {
				this.$el.html(this.tplFinished(this.model.toJSON()));
				
				channel.trigger('addPaths');
			}

			if (!this.model.get('totalPages')) {
				this.$el.html(this.tplNotFound());
			}

		},

		getEvents: function(search_val, param) {

			this.model.clear().set(this.model.defaults);

			var self = this;

			(function go() {
				Backbone.ajax({
					url: 'http://ws.audioscrobbler.com/2.0/',
					type: 'GET',
					data: {
						method: param,
						location: search_val,
						artist: search_val,
						autocorrect: 1,
						page: self.model.get('page'),
						limit: 10,
						api_key: 'dd349d2176d3b97b8162bb0c0e583b1c',
						format: 'json'
					},
					success: function(data) {
						self.getEventsData(data, param);

						self.model.set('page', self.model.get('page') + 1);

						if (self.model.get('page') <= self.model.get('totalPages')) {
							go();
						}
					}
				});
			}());

		},

		getEventsData: function(data, param) {

			var self = this;

			if (data.error == 8 || data.events.total == 0) {
				this.model.set({totalPages: 0});
				return false;
			}

			this.model.set({totalPages: data.events["@attr"].totalPages,
						total: data.events["@attr"].total});

			this.render();

			var events = data.events.event;

			if (this.model.get('page') == this.model.get('totalPages') && /1$/.test(this.model.get('total'))) {
				channel.trigger('addEvents', events, param);	
				return false;
			}

			events.forEach(function(value, index) {
				channel.trigger('addEvents', value, param);				

				/*if (self.model.get('page') == 1 && index == 0) {
					mapView.getMap().setView(
						L.latLng(value.venue.location['geo:point']['geo:lat'], 
								 value.venue.location['geo:point']['geo:long']), 
						param == "artist" ? 4 : 12);
				}*/
			});

		}

	});

});