Meteor.publishComposite('adminCollectionDoc', function (collection, id) {
    check(collection, String);
    check(id, Match.OneOf(String, Mongo.ObjectID));
    if (Roles.userIsInRole(this.userId, ['admin'])) {
        return {
            find: function () {
                return adminCollectionObject(collection).find(id);
            },
            children:  (   AdminConfig && AdminConfig.collections
                        && AdminConfig.collections[collection]
                        && AdminConfig.collections[collection].children)
                     ? AdminConfig.collections[collection].children : []
        };
    } else {
        return this.ready();
    }
});

Meteor.publish('adminUsers', function () {
    if (Roles.userIsInRole(this.userId, ['admin'])) {
        return Meteor.users.find();
    } else {
        return this.ready();
    }
});

Meteor.publish('adminUser', function () {
    return Meteor.users.find(this.userId);
});

Meteor.publish('adminCollectionsCount', function () {
    var handles, self;
    handles = [];
    self = this;
    _.each(AdminTables, function (table, name) {
        var count, id, ready;
        id = new Mongo.ObjectID();
        count = 0;
        ready = false;
        handles.push(table.collection.find().observeChanges({
            added: function () {
                count += 1;
                return ready && self.changed('adminCollectionsCount', id, {
                    count: count
                });
            },
            removed: function () {
                count -= 1;
                return ready && self.changed('adminCollectionsCount', id, {
                    count: count
                });
            }
        }));
        ready = true;
        return self.added('adminCollectionsCount', id, {
            collection: name,
            count: count
        });
    });
    self.onStop(function () {
        return _.each(handles, function (handle) {
            return handle.stop();
        });
    });
    return self.ready();
});

Meteor.publish(null, function () {
    return Meteor.roles.find({});
});