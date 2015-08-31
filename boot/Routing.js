module.exports = Routing = {};

/**
 * Entry point for routing class.
 * Loads routes from routes.js file inside app dir,
 * and registers handlers for that routes based on
 * the settings in that file.
 */
Routing.initRouting = function(next) {

    /// Object property, holds routes...
    this.routes = {
        r: {},
        host: this.app.get('host'),
        get: Routing.get
    };

    /// Load routes..
    var loadSuccess = Routing.loadRoutes.apply(this, [this.dir.app + '/routes.js']);

    /// Register handlers, in this case we register routes and
    /// assign the same function to all of them. The difference
    /// is in the arguments passed to that function. In these
    /// arguments we have controller which will be initialized
    /// and a method name which will be called.
    if (loadSuccess) {
        for (var i in this.routes.r) {
            Routing.registerRoute.apply(this, [this.routes.r[i], i]);
        }
    }

    next();
};

/**
 * Sets loads the routes from the file passed as an argument, or
 * loads routes from an object passed as an argument.
 * Prefix parameter will add a prefix string to all routes.
 * @param routesFileOrObject
 * @param prefix
 * @returns {boolean}
 */
Routing.loadRoutes = function(routesFileOrObject, prefix) {
    var self = this, routes, i, j;

    /// Load routes...
    if ('string' === typeof routesFileOrObject) {
        try {
            routes = require(routesFileOrObject);
        } catch(e) {
            this.log(e);
            return false;
        }
    } else if ('object' === typeof routesFileOrObject) {
        routes = routesFileOrObject;
    } else {
        return true;
    }

    /// Add routes to collection...
    for (i in routes) {
        /// When a resource is defined for a route, it is taken as a file
        /// in which routes are defined. This has some advantages; for
        /// example if we have a lot of routes and we want to divide them
        /// into many smaller files, or if some routes have some common
        /// prefix and we do not want to repeat that prefix in our routes.

        if ('undefined' !== typeof routes[i].resource) {
            Routing.loadRoutes.apply(this, [this.dir.app + routes[i].resource, routes[i].prefix]);
        } else {
            /// If it's not a resource file, register route.
            /// Add prefix to the routes if one is defined.
            if ('undefined' !== typeof prefix && prefix.length) {
                /// Prefix may be a string or an array.
                /// If it's a string just assign route data.
                if ('string' === typeof prefix) {
                    assignRoute(i, routes[i], prefix);
                }

                /// If it's an array, assign value for each prefix...
                if (Array.isArray(prefix)) {
                    for (j in prefix) {
                        assignRoute(i, routes[i], prefix[j]);
                    }
                }
            } else {
                /// Assign a route to a routes registry...
                assignRoute(i, routes[i]);
            }

            /// Checks if the route index is already registered.
            /// If so, create a new index and test it, repeat
            /// until you find a route index which has not yet
            /// been registered.
            function checkRouteIndex(idx) {
                var cnt = 0, newIdx;
                if ('undefined' !== typeof self.routes.r[idx]) {
                    do {
                        cnt++;
                        newIdx = idx + cnt;
                    } while ('undefined' !== typeof self.routes.r[newIdx]);

                    return newIdx;
                } else {
                    return idx;
                }
            }

            /// Receives some route data as an argument, and
            /// adds this route to the route registry. If the
            /// route has a prefix defined for it, it will add
            /// that prefix to the route url.
            function assignRoute(idx, routeData, routePrefix) {
                var routeName = checkRouteIndex(idx);

                /// Assign...
                self.routes.r[routeName] = self.utils.copyObject(routeData);

                /// If route prefix is defined...
                if (routePrefix) {
                    self.routes.r[routeName].url = routePrefix + self.routes.r[routeName].url;
                }
            }
        }
    }

    return true;
};


/**
 * Check that route has necessary data and register route handlers.
 * @param routeData
 * @param routeName
 */
Routing.registerRoute = function(routeData, routeName) {
    var i;
    if ('undefined' === typeof routeData.url) {
        if ('dev' === this.app.get('env') && !routeName.match(/^(socket\:)/gi)) {
            /// TODO: find a better way to display this info, or not
            //this.log("Url [url] is not defined for " + routeName + "\n");
        }
    } else if ('undefined' === typeof routeData.ctl) {
        if ('development' === Jet.app.get('env')) {
            /// TODO: find a better way to display this info, or not
            //this.log("Controller [ctl] is not defined for " + routeName);
        }
    } else {
        var method = routeData.method ? routeData.method : 'default';
        var verb = ['all'];
        var verbsAllowed = [
            'get', 'post', 'put', 'delete', 'checkout', 'connect', 'copy', 'head', 'lock', 'merge', 'mkactivity', 'mkcol',
            'move', 'm-search', 'notify', 'options', 'patch', 'propfind', 'proppatch', 'purge', 'report', 'search',
            'subscribe', 'trace', 'unlock', 'unsubscribe'
        ];

        /// Function defined action for this verb...
        if (routeData.verb) {
            if (Array.isArray(routeData.verb)) {
                var tmpVerbs = [];
                for (i in routeData.verb) {
                    if (verbsAllowed.indexOf(routeData.verb[i].toLowerCase()) > -1) {
                        tmpVerbs.push(routeData.verb[i].toLowerCase());
                    }
                }
                verb = tmpVerbs.length ? tmpVerbs : verb;
            } else if ('string' === typeof routeData.verb && verbsAllowed.indexOf(routeData.verb.toLowerCase()) > -1) {
                verb = [routeData.verb.toLowerCase()];
            }
        }

        /// Register route for specific verbs...
        var self = this;
        for (i in verb) {
            this.app[verb[i]](routeData.url, function(req, res) {
                Routing.callJetController.apply(self, [req, res, routeData.ctl, method]);
            });
        }
    }
};


/**
 * All routes handler, difference is in the value of the arguments.
 * For each route, these data should be different (if not specified
 * differently in routes.js)
 *
 * @param req
 * @param res
 * @param ctl
 * @param method
 */
Routing.callJetController = function(req, res, ctl, method) {
    var JetControllerObject = require(this.dir.jet + "/core/JetController.js");
    var JetController = new JetControllerObject(this);

    /// Execute in the context of the framework, so all the functionality is available.
    JetController.process(req, res, ctl, method);
};


/**
 * Return url based on the name of the route. Route name is the index on which
 * route handling data is located in routes.js file.
 * Intention for use of this function is in templates, instead of writing
 * each url manualy, just call this method from the global variable Jet.routes,
 * and get the path for the route.
 *
 * @param name
 * @param params
 * @param fullUrl
 * @returns {*}
 */
Routing.get = function(name, params, fullUrl) {
    if ('boolean' === typeof params) {
        fullUrl = params;
        params  = null;
    }
    if ('undefined' !== typeof this.r[name]) {
        var url = this.r[name].url;
        if (params) {
            for (var i in params) {
                url = url.replace(':' + i, encodeURIComponent(params[i])).replace(/\(.*\)/g, "");
            }
        }
        return fullUrl ? this.host + url : url;
    } else {
        return "/";
    }
};

