var adminCreateRouteEdit,
    adminCreateRouteNew,
    adminCreateRouteView,
    adminCreateRoutes,
    adminCreateTables,
    adminDelButton,
    adminEditButton,
    adminEditDelButtons,
    adminPublishTables,
    adminTablePubName,
    adminTablesDom,
    defaultColumns;

this.AdminTables = {};

adminTablesDom =
    '<"box"<"box-header"<"box-toolbar"<"pull-left"<lf>><"pull-right"p>>><"box-body"t>>';

adminEditButton = {
    data: '_id',
    title: 'Edit',
    createdCell: function (node, cellData, rowData) {
        return $(node).html(Blaze.toHTMLWithData(Template.adminEditBtn, {
            _id: cellData
        }, node));
    },
    width: '40px',
    orderable: false
};

adminDelButton = {
    data: '_id',
    title: 'Delete',
    createdCell: function (node, cellData, rowData) {
        return $(node).html(Blaze.toHTMLWithData(Template.adminDeleteBtn, {
            _id: cellData
        }, node));
    },
    width: '40px',
    orderable: false
};

adminEditDelButtons = [adminEditButton, adminDelButton];

defaultColumns = function () {
    return [
        {
            data: '_id',
            title: 'ID'
        }
    ];
};

AdminTables.Users = new Tabular.Table({
    changeSelector: function (selector, userId) {
        var $or;
        $or = selector.$or;
        //$or && (selector.$or = _.map($or, function (exp) {
        if ($or) {
            selector.$or = _.map($or, function (exp) {
                if (exp.emails && exp.emails.$regex) {
                    return {
                        emails: {
                            $elemMatch: {
                                address: exp.emails
                            }
                        }
                    };
                } else {
                    return exp;
                }
            });
        }
        return selector;
    },
    name: 'Users',
    collection: Meteor.users,
    columns: _.union([
        {
            data: '_id',
            title: 'Admin',
            createdCell: function (node, cellData, rowData) {
                return $(node).html(Blaze.toHTMLWithData(Template.adminUsersIsAdmin, {
                    _id: cellData
                }, node));
            },
            width: '40px'
        }, {
            data: 'emails',
            title: 'Email',
            render: function (value) {
                return value[0].address;
            },
            searchable: true
        }, {
            data: 'emails',
            title: 'Mail',
            createdCell: function (node, cellData, rowData) {
                return $(node).html(Blaze.toHTMLWithData(Template.adminUsersMailBtn, {
                    emails: cellData
                }, node));
            },
            width: '40px'
        }, {
            data: 'createdAt',
            title: 'Joined'
        }
    ], adminEditDelButtons),
    dom: adminTablesDom
});

adminTablePubName = function (collection) {
    return "admin_tabular_" + collection;
};

adminCreateTables = function (collections) {
    return _.each(AdminConfig ? AdminConfig.collections : undefined,
                  function (collection, name) {
        var columns;
        _.defaults(collection, {
            showEditColumn: true,
            showDelColumn: true
        });
        columns = _.map(collection.tableColumns, function (column) {
            var createdCell;
            if (column.template) {
                createdCell = function (node, cellData, rowData) {
                    $(node).html('');
                    return Blaze.renderWithData(Template[column.template], {
                        value: cellData,
                        doc: rowData
                    }, node);
                };
            }
            return {
                data: column.name,
                title: column.label,
                createdCell: createdCell
            };
        });
        if (columns.length === 0) {
            columns = defaultColumns();
        }
        if (collection.showEditColumn) {
            columns.push(adminEditButton);
        }
        if (collection.showDelColumn) {
            columns.push(adminDelButton);
        }
        //return AdminTables[name] = new Tabular.Table({
        AdminTables[name] = new Tabular.Table({
            name: name,
            collection: adminCollectionObject(name),
            pub: collection.children && adminTablePubName(name),
            sub: collection.sub,
            columns: columns,
            extraFields: collection.extraFields,
            dom: adminTablesDom
        });
        return AdminTables[name];
    });
};

adminCreateRoutes = function (collections) {
    _.each(collections, adminCreateRouteView);
    _.each(collections, adminCreateRouteNew);
    return _.each(collections, adminCreateRouteEdit);
};

adminCreateRouteView = function (collection, collectionName) {
    return Router.route("adminDashboard" + collectionName + "View", {
        path: "/admin/" + collectionName,
        template: "AdminDashboardViewWrapper",
        controller: "AdminController",
        data: function () {
            return {
                admin_table: AdminTables[collectionName]
            };
        },
        action: function () {
            return this.render();
        },
        onAfterAction: function () {
            Session.set('admin_title', collectionName);
            Session.set('admin_subtitle', 'View');
            return Session.set('admin_collection_name', collectionName);
        }
    });
};

adminCreateRouteNew = function (collection, collectionName) {
    return Router.route("adminDashboard" + collectionName + "New", {
        path: "/admin/" + collectionName + "/new",
        template: "AdminDashboardNew",
        controller: "AdminController",
        action: function () {
            return this.render();
        },
        onAfterAction: function () {
            Session.set('admin_title', AdminDashboard.collectionLabel(collectionName));
            Session.set('admin_subtitle', 'Create new');
            Session.set('admin_collection_page', 'new');
            return Session.set('admin_collection_name', collectionName);
        },
        data: function () {
            return {
                admin_collection: adminCollectionObject(collectionName)
            };
        }
    });
};

adminCreateRouteEdit = function (collection, collectionName) {
    return Router.route("adminDashboard" + collectionName + "Edit", {
        path: "/admin/" + collectionName + "/:_id/edit",
        template: "AdminDashboardEdit",
        controller: "AdminController",
        waitOn: function () {
            return Meteor.subscribe('adminCollectionDoc', collectionName, parseID(this.params._id));
        },
        action: function () {
            return this.render();
        },
        onAfterAction: function () {
            Session.set('admin_title', AdminDashboard.collectionLabel(collectionName));
            Session.set('admin_subtitle', 'Edit ' + this.params._id);
            Session.set('admin_collection_page', 'edit');
            Session.set('admin_collection_name', collectionName);
            Session.set('admin_id', parseID(this.params._id));
            return Session.set('admin_doc', adminCollectionObject(collectionName).findOne({
                _id: parseID(this.params._id)
            }));
        },
        data: function () {
            return {
                admin_collection: adminCollectionObject(collectionName)
            };
        }
    });
};

adminPublishTables = function (collections) {
    return _.each(collections, function (collection, name) {
        if (!collection.children) {
            return void 0;
        }
        return Meteor.publishComposite(adminTablePubName(name), function (tableName, ids, fields) {
            var extraFields;
            check(tableName, String);
            check(ids, Array);
            check(fields, Match.Optional(Object));
            extraFields = _.reduce(collection.extraFields, function (fields, name) {
                fields[name] = 1;
                return fields;
            }, {});
            _.extend(fields, extraFields);
            this.unblock();
            return {
                find: function () {
                    this.unblock();
                    return adminCollectionObject(name).find({
                        _id: {
                            $in: ids
                        }
                    }, {
                        fields: fields
                    });
                },
                children: collection.children
            };
        });
    });
};

// TODO refactor
Meteor.startup(function () {
    adminCreateTables(AdminConfig ? AdminConfig.collections : undefined);
    adminCreateRoutes(AdminConfig ? AdminConfig.collections : undefined);
    if (Meteor.isServer) {
        return adminPublishTables(AdminConfig ? AdminConfig.collections : undefined);
    }
});