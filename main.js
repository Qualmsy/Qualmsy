Messages = new Mongo.Collection('messages');
People = new Mongo.Collection('people');
if (Meteor.isClient) {
  Meteor.subscribe("messages");
  Meteor.subscribe("people");

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
