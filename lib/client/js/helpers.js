var adminCollections;

Template.registerHelper('AdminTables', AdminTables);

adminCollections = function() {
  var collections;
  collections = {};
  if (typeof AdminConfig !== 'undefined' && typeof AdminConfig.collections === 'object') {
    collections = AdminConfig.collections;
  }
  collections.Users = {
    collectionObject: Meteor.users,
    icon: 'user',
    label: 'Users'
  };
  return _.map(collections, function(obj, key) {
    obj = _.extend(obj, {
      name: key
    });
    obj = _.defaults(obj, {
      label: key,
      icon: 'plus',
      color: 'blue'
    });
    //return obj = _.extend(obj, {
    obj = _.extend(obj, {
      viewPath: Router.path("adminDashboard" + key + "View"),
      newPath: Router.path("adminDashboard" + key + "New")
    });
    return obj;
  });
};

UI.registerHelper('AdminConfig', function() {
  if (typeof AdminConfig !== 'undefined') {
    return AdminConfig;
  }
});

UI.registerHelper('admin_skin', function() {
  return (AdminConfig && AdminConfig.skin ? AdminConfig.skin : 'blue');
});

UI.registerHelper('admin_collections', adminCollections);

UI.registerHelper('admin_collection_name', function() {
  return Session.get('admin_collection_name');
});

UI.registerHelper('admin_current_id', function() {
  return Session.get('admin_id');
});

UI.registerHelper('admin_current_doc', function() {
  return Session.get('admin_doc');
});

UI.registerHelper('admin_is_users_collection', function() {
  return Session.get('admin_collection_name') === 'Users';
});

UI.registerHelper('admin_sidebar_items', function() {
  return AdminDashboard.sidebarItems;
});

UI.registerHelper('admin_collection_items', function() {
  var items;
  items = [];
  _.each(AdminDashboard.collectionItems, (function(_this) {
    return function(fn) {
      var item;
      item = fn(_this.name, '/admin/' + _this.name);
      if ((item ? item.title : void 0) && (item ? item.url : void 0)) {
        return items.push(item);
      }
    };
  })(this));
  return items;
});

UI.registerHelper('admin_omit_fields', function() {
  var collection, global;
  if (AdminConfig.autoForm && typeof AdminConfig.autoForm.omitFields === 'object') {
    global = AdminConfig.autoForm.omitFields;
  }
  if (   !Session.equals('admin_collection_name', 'Users')
      && AdminConfig
      && typeof AdminConfig.collections[Session.get('admin_collection_name')].omitFields === 'object') {
    collection = AdminConfig.collections[Session.get('admin_collection_name')].omitFields;
  }
  if (typeof global === 'object' && typeof collection === 'object') {
    return _.union(global, collection);
  } else if (typeof global === 'object') {
    return global;
  } else if (typeof collection === 'object') {
    return collection;
  }
});

UI.registerHelper('AdminSchemas', function() {
  return AdminDashboard.schemas;
});

UI.registerHelper('adminGetSkin', function() {
  if (AdminConfig.dashboard && typeof AdminConfig.dashboard.skin === 'string') {
    return AdminConfig.dashboard.skin;
  } else {
    return 'blue';
  }
});

UI.registerHelper('adminIsUserInRole', function(_id, role) {
  return Roles.userIsInRole(_id, role);
});

UI.registerHelper('adminGetUsers', function() {
  return Meteor.users;
});

UI.registerHelper('adminGetUserSchema', function() {
  var schema;
  if (_.has(AdminConfig, 'userSchema')) {
    schema = AdminConfig.userSchema;
  } else if (typeof Meteor.users._c2 === 'object') {
    schema = Meteor.users.simpleSchema();
  }
  return schema;
});

UI.registerHelper('adminCollectionLabel', function(collection) {
  if (collection) {
    return AdminDashboard.collectionLabel(collection);
  }
});

UI.registerHelper('adminCollectionCount', function(collection) {
  var ref;
  if (collection === 'Users') {
    return Meteor.users.find().count();
  } else {
    return (ref = AdminCollectionsCount.findOne({
      collection: collection
    })) ? ref.count : void 0;
  }
});

// TODO remove reference to users
UI.registerHelper('adminTemplate', function(collection, mode) {
  if (   collection && collection.toLowerCase() !== 'users'
      && AdminConfig && AdminConfig.collections && AdminConfig.collections[collection]
      && AdminConfig.collections[collection].templates) {
    return AdminConfig.collections[collection].templates[mode];
  }
});

UI.registerHelper('adminGetCollection', function(collection) {
  return _.find(adminCollections(), function(item) {
    return item.name === collection;
  });
});

UI.registerHelper('adminWidgets', function() {
  if (AdminConfig.dashboard !== undefined && AdminConfig.dashboard.widgets !== undefined) {
    return AdminConfig.dashboard.widgets;
  }
});

UI.registerHelper('adminUserEmail', function(user) {
  if (user && user.emails && user.emails[0] && user.emails[0].address) {
    return user.emails[0].address;
  } else if (user && user.services && user.services.facebook && user.services.facebook.email) {
    return user.services.facebook.email;
  } else if (user && user.services && user.services.google && user.services.google.email) {
    return user.services.google.email;
  }
});