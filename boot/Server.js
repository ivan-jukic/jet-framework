module.exports = Server = {};

/**
 * Bind server to a port. Port number is given through
 * command line interface on app startup or through
 * arguments object.
 */
Server.initServer = function(next) {
    var self = this;

    /// Create server...
    this.server = require('http').createServer(this.app);

    /// Initialize web sockets...
    if (this.app.get('useWebSockets')) {
        Server.initWebSockets.call(this);
    }

    /// Server listen connections...
    this.server.listen(process.env.PORT,
        function() {
            self.log("Server started on port " + process.env.PORT);

            /// Fire on server listen event handlers in framework context.
            for(var i in self.eventHandlers['onServerStart']) {
                self.eventHandlers['onServerStart'][i].call(self);
            }

            next();
        }).on('error', function(err) {
            throw new Error(err);
        });

    /// Initialize additional modules...
    Server.initAdditionalModules.call(this);
};

/**
 * Initialize additional modules for the app.
 */
Server.initAdditionalModules = function() {
    /// Template engine
    this.jade = require("jade");

    /// Create an object in which compiled templates will be stored as functions. Also, keep track
    /// of template last modification time which will be used to re-compile template if it's different
    /// than before.
    /// {pathToTemplate: {fn:[Function], mtime: [Date]}}

    this.jadeTemplates = {};
};

/**
 * Initialize socket events and store.
 */
Server.initWebSockets = function() {
    /// Init socket io module...
    this.io = require("socket.io")(this.server);

    /// Read socket event from routes file.
    var events = Server.getSocketEvents.call(this);
    if (events) {
        /// Initialize redis session.
        Server.initSocketStore.call(this);

        /// Register socket event handlers .
        Server.registerSocketEvents.call(this, events);

        /// Initialize socket middleware.
        Server.initSocketMiddleware.call(this, events);
    }
};

/**
 * Receives an object with defined namespaces, and events for each namespace.
 * @param events
 * @returns {boolean}
 */
Server.registerSocketEvents = function(events) {
    /// Make sure that events is an object.
    if ('object' !== typeof events) {
        return false;
    }

    /// Make sure io is initialized.
    if (!this.io) {
        return false;
    }

    /// Read and define events.
    var namespace;
    var self = this;
    for (namespace in events) {
        /// First iteration index is namespace.
        if ("/" === namespace) {
            this.io.on('connection', function(socket) {
                Server.__registerSocketEvents.apply(self, [socket, events[namespace], namespace]);
            });
        } else {
            this.io.of(namespace).on('connection', function(socket) {
                Server.__registerSocketEvents.apply(self, [socket, events[namespace], namespace]);
            });
        }
    }

    return true;
};


/**
 * Initializes modules which are used as
 * a middleware when socket request is
 * received.
 */
Server.initSocketMiddleware = function(events) {
    var i, tmp, namespace;
    var middleware = [
        "SocketRequestResponse",
        "SocketCookieParser",
        "SocketSession",
        "SocketClientIP"
    ];

    for(i in middleware) {
        try {
            tmp = require(this.dir.jet + "/lib/socketMiddleware/" + middleware[i]);
        } catch(e) {
            this.log(e);
            continue;
        }

        for (namespace in events) {
            if ("/" === namespace) {
                this.io.use(tmp.call(this)); /// Use this middleware...
            } else {
                this.io.of(namespace).use(tmp.call(this)); /// Use this middleware...
            }
        }
    }
};


/**
 *
 * @param socket
 * @param events
 * @param namespace
 * @private
 */
Server.__registerSocketEvents = function(socket, events, namespace) {
    var self = this;
    for (var i in events) {
        try {
            /// Validate event data...
            events[i] = Server.__validateEvent.apply(this, [i, events[i]]);
        } catch (e) {
            this.log(e);
            continue;
        }

        if ('connection' === i) {
            /// If this is connect event, fire it now...
            Server.__callSocketEventHandler.apply(socket, [self, events[i], null, i, namespace]);
        } else {
            /// Assign event handling...
            assignEvent(socket, i, events[i], namespace);
        }
    }

    function assignEvent(socket, eventName, eventData, namespace) {
        /// Else, register event...
        socket.on(eventName, function(data) {
            /// call event handler when socket receives an event...
            Server.__callSocketEventHandler.apply(socket, [self, eventData, data, eventName, namespace]);
        });
    }
};

/**
 * Receives data about event and calls appropriate handler.
 * First parameter is event object defined in events.js.
 * @param Jet
 * @param event
 * @param data
 * @param eventName
 * @param namespace
 * @private
 */
Server.__callSocketEventHandler = function(Jet, event, data, eventName, namespace) {
    var socket = this;
    var req = socket.req;
    var res = socket.res;

    /// Event object...
    req.setEvent(event);
    req.setEvent(event);

    /// Event name...
    req.setEventName(eventName);
    res.setEventName(eventName);

    /// Event namespace...
    req.setEventNamespace(namespace);
    res.setEventNamespace(namespace);

    /// Set data...
    req.setPost(data);

    /// Get jet controller!
    var JetController= require(Jet.dir.jet + "/core/JetController.js");
    var JC = new JetController(Jet);

    /// Process socket request...
    JC.process(req, res, event.ctl, event.method);
};

/**
 * If controller is not defined throw exception.
 * If the method is not defined, use default.
 * @param name
 * @param event
 * @private
 */
Server.__validateEvent = function(name, event) {
    if ('undefined' === typeof event.ctl) {
        throw new Error("Event " + name + " does not have controller defined");
    }
    if ('undefined' === typeof event.method) {
        event.method = 'default';
    }
    return event;
};

/**
 * Read routes file, extract events and return the resulting object.
 * Socket events are denoted by "socket:<event_name>" in routes file.
 * If the route also has url it will also be registered as a normal
 * http endpoint, otherwise it will only be used as a socket event.
 * To define event namespace, use namespace property in
 * @returns {object}
 */
Server.getSocketEvents = function() {
    var i, routes, namespace, eventName;
    var events = null;
    try {
        routes = require(this.dir.app + "/routes.js");
        for (i in routes) {
            if (i.match(/^(socket\:)/gi)) {
                events = events || {};
                var eventParts = i.split(":");

                /// If we get 3 parts, we have namespace defined...
                if (2 === eventParts.length) {
                    /// Use default namespace...
                    namespace = "/";
                    /// The name of the event.
                    eventName = eventParts[1];
                } else {
                    /// Namespace is defined..
                    namespace = "/" + eventParts[1];
                    /// Determine event name, by the remaining items in the array...
                    eventName = eventParts.slice(2).join(":");
                }

                /// Create namespace entry if it doesn't exits...
                if (!events[namespace]) {
                    events[namespace] = {};
                }

                /// Create entry for the event.
                events[namespace][eventName] = {};

                /// Add controller ...
                events[namespace][eventName].ctl = routes[i].ctl;

                /// Check if method is available...
                events[namespace][eventName].method = routes[i].method ? routes[i].method : 'default';
            }
        }
        return events;
    } catch(e) {
        this.log(e);
        return false;
    }
};

/**
 * Initialize socket store. All socket data will be stored in redis if available.
 * @returns {boolean}
 */
Server.initSocketStore = function() {
    if (!this.app.get('useRedis')) {
        return false;
    }

    /// Initialize redis storage for sockets...
    var socketRedis = require("socket.io-redis");
    var redisOptions = this.app.get("redisOptions");

    if (redisOptions) {
        this.io.adapter(
            socketRedis({
                key: "jetSocket:" + this.app.get('projectName').replace(/\s+/gi, "_"),
                host: redisOptions.host,
                port: redisOptions.port
            })
        );
    }

    return true;
};
