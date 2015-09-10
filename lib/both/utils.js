this.adminCollectionObject = function (collection) {
    if (   AdminConfig.collections[collection] !== undefined
        && AdminConfig.collections[collection].collectionObject !== undefined) {
        return AdminConfig.collections[collection].collectionObject;
    } else {
        return lookup(collection);
    }
};

this.adminCallback = function (name, args, callback) {
    var func, stop;
    stop = false;
    if (AdminConfig.callbacks && typeof AdminConfig.callbacks[name] === "function") {
        func = AdminConfig.callbacks[name];
        stop = (func.apply(func, args) === false);
        //stop = !func.apply(func, args);
    }
    if (typeof callback === 'function') {
        if (!stop) {
            return callback.apply(null, args);
        }
    }
};

this.lookup = function (obj, root, required) {
    var arr, ref;
    if (required === null || required === undefined) {
        required = true;
    }
    if (typeof root === 'undefined') {
        root = Meteor.isServer ? global : window;
    }
    if (typeof obj === 'string') {
        ref = root;
        arr = obj.split('.');
        while (arr.length && (ref = ref[arr.shift()])) {
            continue;
        }
        if (!ref && required) {
            throw new Error(obj + ' is not in the ' + root.toString());
        } else {
            return ref;
        }
    }
    return obj;
};

this.parseID = function (id) {
    if (typeof id === 'string') {
        if (id.indexOf("ObjectID") > -1) {
            return new Mongo.ObjectID(id.slice(id.indexOf('"') + 1, id.lastIndexOf('"')));
        } else {
            return id;
        }
    } else {
        return id;
    }
};

this.parseIDs = function (ids) {
    return _.map(ids, function (id) {
        return parseID(id);
    });
};