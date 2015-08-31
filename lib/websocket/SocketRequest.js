/**
 * Object used to provide same methods as they are on the normal request object.
 * This will enable us to reuse existing controllers for socket requests.
 *
 * TODO: properly test this functionality, and make sure it is equal to express object, and that the values are set *
 * TODO: add secure socket connection TLS/SSL
 *
 * @type {Function}
 */
module.exports = SocketRequest = function(socket) {
    this.Jet = null;
    this.app = null;
    this.baseUrl = null;
    this.body = {};
    this.cookies = null;
    this.fresh = true;
    this.hostname = null;
    this.ip = '0.0.0.0';
    this.originalUrl = null;
    this.params = {};
    this.path = "";
    this.prototcol = "ws";
    this.query = {};
    this.route = null;
    this.secure = false;
    this.signedCookies = {};
    this.stale = false;
    this.subdomains = [];
    this.xhr = false;
    this.isSocket = true;
    this.socket = socket;
    this.session = undefined;
    this.headers = null;
    this.event = null;
    this.eventName = null;
    this.eventNamespace = null;
};

/// TODO: implement these methods
SocketRequest.prototype.accepts = function(types) {};
SocketRequest.prototype.acceptsCharsets = function() {};
SocketRequest.prototype.acceptsLanguages = function() {};
SocketRequest.prototype.is = function(type) {}; /// Check if the header content-type has a certain type

/**
 * Returns the value of the header field.
 * @param field
 * @return {string|undefined}
 */
SocketRequest.prototype.get = function(field) {
    var i;
    for(i in this.headers) {
        if (i.toLowerCase() === field.toLowerCase()) {
            return this.headers[i];
        }
    }
    return undefined;
};

/**
 * Get socket id, specific for this request.
 * @returns {*}
 */
SocketRequest.prototype.getSocketID = function() {
    if (this.socket) {
        return this.socket.id;
    }
    return null;
};

/**
 * Get socket reference.
 * @returns {*}
 */
SocketRequest.prototype.getSocket = function() {
    if (this.socket) {
        return this.socket;
    }
    return null;
};

/**
 * Set cookies received through socket connection.
 * @param cookies
 */
SocketRequest.prototype.setCookies = function(cookies) {
    this.cookies = cookies;
};

/**
 * Set session, loaded through socket session middleware, and set it here.
 * @param session
 */
SocketRequest.prototype.setSession = function(session) {
    this.session = session;
};

/**
 * Set event object, which is defined in events.js.
 * @param eventObject
 */
SocketRequest.prototype.setEvent = function(eventObject) {
    this.event = eventObject;
};

/**
 * Returns the event object.
 * @returns {object|null}
 */
SocketRequest.prototype.getEvent = function() {
    return this.event;
};

/**
 * Set received event name.
 * @param eventName
 */
SocketRequest.prototype.setEventName = function(eventName) {
    this.eventName = eventName;
    this.path = eventName;
};

/**
 * Returns event name raised...
 * @returns {null|string}
 */
SocketRequest.prototype.getEventName = function() {
    return this.eventName;
};

/**
 * Set namespace in which event was received.
 * @param eventNamespace
 */
SocketRequest.prototype.setEventNamespace = function(eventNamespace) {
    this.eventNamespace = eventNamespace;
};

/**
 * Returns namespace of the event!
 * @returns {null|string}
 */
SocketRequest.prototype.getEventNamespace = function() {
    return this.eventNamespace;
};

/**
 * This method will set all the data that was received through
 * the socket in body of the request to be compatible with
 * regular http requests.
 * @param post
 */
SocketRequest.prototype.setPost = function(post) {
    if (post) {
        if (this.body) {
            for (var i in post) {
                this.body[i] = post[i];
            }
        } else {
            this.body = post;
        }
    }
};
