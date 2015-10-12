Messages = new Mongo.Collection('messages');
People = new Mongo.Collection('people');
if (Meteor.isClient) {
  Meteor.subscribe("messages");
  Meteor.subscribe("people");
Session.setDefault('showusers', false);
Session.setDefault('user', false);
var messagesclicked = [];

Template.body.helpers({
	messages: function () {
		var now = new Date();
		var selfposition = Session.get('user').position;
		var m = Messages.find({_id: {$nin: messagesclicked}}, {sort: {timestamp: -1}, limit: 20}).fetch();
		return _.sortBy(m, function(message){
			var posdiff = Math.abs(selfposition - message.position);
			var timediff = (now - message.timestamp) / 60000;
			if (message.echo) {
				var echo = message.echo;
			}
			else {
				var echo = 0;
			}
			var loudness = posdiff + timediff - echo;
			if (loudness<0) loudness=0;
			return loudness; });
		//return Messages.find({}, {sort: {timestamp: -1}});
	},
	people: function () {
		return People.find({});
	},
	showingusers: function () {
		return !!Session.get('showusers');
	},
	hasUsername: function () {
		return !!Session.get('user');
	}
});
Template.body.events({
	"click .toggle": function (event) {
		var s = Session.get('showusers');
		s = !s;
		Session.set('showusers', s);
	},
	"click .messagebox": function (event) {
		var el = event.target;
		var id = el.getAttribute("data-id");
		Messages.update({_id: id}, {$inc: {echo:5}});
		messagesclicked.push(id);
	}
});
Template.body.viewmodel('main',{
	message: '',
	logMessage: function () {
		var message = {
			text: this.message(),
			timestamp: new Date(),
			owner: Session.get('user').username,
			position: Session.get('user').position,
			echo: 0
		};
		Messages.insert(message);
		this.message('');
	},
	username: '',
	insertusername: function () {
		if (Meteor.userId()) {
			var person = {
				username: this.username(),
				user: Meteor.userId(),
				position: People.find().count() + 1
			};
			People.insert(person);
			Session.set('user', person);
			this.username('');
		}
	}
});
}

if (Meteor.isServer) {
  Meteor.publish("messages", function () {
    return Messages.find();
  });
  Meteor.publish("people", function () {
    return People.find();
  });
  Messages.allow({
    insert: function (userId, doc) {
      return (userId);
    },
    update: function (userId, doc) {
      return (userId);
    }
  });
  People.allow({
    insert: function (userId, doc) {
      return (userId && doc.user === userId);
    }
  });
  Meteor.startup(function () {
  });
}
