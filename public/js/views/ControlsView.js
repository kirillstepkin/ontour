define(['channel',
		'text', 
		'text!templates/Controls.tmpl',
		'marionette'
], function(channel, text, controlsTmpl, Marionette) {
	'use strict';

	return Marionette.ItemView.extend({

		itemViewContainer: '#controls',

		template: _.template(controlsTmpl),

		ui: {
			gotop   : '#go-top',
			slide   : '#slide',
			layers	: '.layers',
			paths   : '#paths',
			markers : '#markers',
			picker	: '#date-selector',
			date	: '#date'
		},

		events: {
			'click @ui.slide'   : 'toggleSidebar',
			'click @ui.markers' : 'switchMarkers',
			'click @ui.paths'   : 'switchPaths',
			'click @ui.gotop'   : 'gotop',
			'click @ui.picker'  : 'toggleDatepicker'
		},

		initialize: function() {
			this.listenTo(channel, 'gotop-show', this.gotopShow);
			this.listenTo(channel, 'gotop-hide', this.gotopHide);
			this.listenTo(channel, 'showControls', this.showControls);
			this.listenTo(channel, 'index-route', this.hideControls);

			this.listenTo(channel, 'setEventYear', this.setEventYear);
			this.listenTo(channel, 'setEventMonth', this.setEventMonth);
			this.listenTo(channel, 'setEventDay', this.setEventDay);

			this.listenTo(this.model, 'change:year change:month change:day', this.filter);
			this.listenTo(this.model, 'change:datepicker', this.showDatepicker);
		},

		toggleDatepicker: function() {
			this.model.set('datepicker', this.model.get('datepicker') ? false : true);
		},

		showDatepicker: function() {
			if (this.model.get('datepicker')) {
				this.ui.picker.addClass('active');
				this.ui.date.show();
			} else {
				this.ui.picker.removeClass('active');
				this.ui.date.hide();
			}
		},

		setEventYear: function(year) {
			this.model.set('year', year);
		},

		setEventMonth: function(month) {
			this.model.set('month', month);
		},

		setEventDay: function(day) {
			this.model.set('day', day);
		},

		showControls: function() {
			this.ui.layers.show();
			this.ui.picker.show();
		},

		hideControls: function() {
			this.ui.layers.hide();
			this.ui.picker.hide();
			this.ui.date.hide();
			this.ui.gotop.hide();
		},

		onShow: function() {
			this.ui.gotop.css({
				display: 'none'
			});
		},

		toggleSidebar: function() {
			$('#sidebar').css('left', (parseInt($('#sidebar').css('left'),10) == 0 ? -$('#sidebar').outerWidth() : 0));

			if (this.ui.gotop.css('display') == 'block') {
				this.ui.gotop.css({display: 'none'});
			}
		},

		filter: function() {
			channel.trigger('filter', {
				year  : this.model.get('year'),
				month : this.model.get('month'),
				day   : this.model.get('day')
			});
		},

		switchMarkers: function() {
			this.ui.markers.toggleClass('active');
			channel.trigger('switchMarkers');
		},

		switchPaths: function() {
			this.ui.paths.toggleClass('active');
			channel.trigger('switchPaths');
		},

		gotop: function() {
			channel.trigger('gotop');
		},

		gotopShow: function() {
			this.ui.gotop.css({
				display: 'inline-block'
			});
		},

		gotopHide: function() {
			this.ui.gotop.css({
				display: 'none'
			});
		}

	});

});