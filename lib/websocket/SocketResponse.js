module.exports = SocketResponse = function(socket) {
    this.Jet = null;
    this.app = null;
    this.headersSent = false;
    this.locals = {}; /// Local variables available only to the view.
    this.isSocket = true;
    this.socket = socket;
    this.event = null;
    this.eventName = null;
    this.eventNamespace = null;
    this.responseName = null;
    this.__socketResponse = true;
    this.__originalSession = undefined; /// Session when the request was received...
};

/**
 * Backs up data in original session. Later when we will
 * send a response back to the client, we will check to
 * see if there were any changes, and save session only
 * if there were any changes.
 * @param originalSession
 */
SocketResponse.prototype.setSession = function(originalSession) {
    /// Copy object values, else if reference is passed this variable
    /// will be updated together with the original session instance.
    if ('object' === typeof originalSession) {
        this.__originalSession = {};
        for (var i in originalSession) {
            this.__originalSession[i] = originalSession[i];
        }
    }
};

/**
 * Event object defined in events.js for this event.
 * @param eventObject
 */
SocketResponse.prototype.setEvent = function(eventObject) {
    this.event = eventObject;
};

/**
 * Name of the event that was received. If we will be sending
 * a response to the client, we will use this name to give
 * <event_name>.response name to our respond event.
 * @param eventName
 */
SocketResponse.prototype.setEventName = function(eventName) {
    this.eventName = eventName;
};

/**
 * Socket namespace from which the event was received.
 * Socket connections may come from different namespaces.
 * @param eventNamespace
 */
SocketResponse.prototype.setEventNamespace = function(eventNamespace) {
    this.eventNamespace = eventNamespace;
};

/**
 * Set the name of the event that will be emited as a response.
 * @param responseName
 */
SocketResponse.prototype.setResponseName = function(responseName) {
    this.responseName = responseName;
};

/**
 * Sends data back to the client. If there is no
 * data, just update the session.
 */
SocketResponse.prototype.end = function() {
    /// If there is data to send...
    if (arguments[0]) {
        /// If data is set and it's a string with length zero, do not send response.
        if ('string' === typeof arguments[0] && !arguments[0].length) {
            this.__saveSession();
            return;
        }
        /// Send response...
        this.send.apply(this, arguments);
    } else {
        this.__saveSession();
    }
};


/**
 * This method is used when there is no responding
 * event for received socket event, but there were
 * changes to session which need to be saved.
 */
SocketResponse.prototype.noResponse = function() {
    /// Just save the session...
    this.end();
};

/**
 * Sends the response through the socket connection.
 * Sends any type of data, how it's handled depends
 * on the client.
 * @param data
 * @private
 */
SocketResponse.prototype.send = function(data) {
    if (!this.socket) {
        console.echo("Socket - no valid socket object");
    } else if (!this.responseName && !this.eventName) {
        this.Jet.log("Socket - no valid event name");
    } else {
        this.socket.emit(this.responseName ? this.responseName : this.eventName + ".response", data);
    }

    /// Handle session...
    this.__saveSession();
};

/**
 * Defined because of compatibility...
 * @param data
 */
SocketResponse.prototype.json = function(data) {
    this.send(data);
};

/**
 * Defined because of compatibility...
 * @param data
 */
SocketResponse.prototype.jsonp = function(data) {
    this.send(data);
};

/**
 * Defined because of compatibility...
 * @param data
 */
SocketResponse.prototype.render = function(data) {
    this.send(data);
};

/**
 * Method which checks if there were any changes in session
 * variables, and saves the session if there were changes.
 * @private
 */
SocketResponse.prototype.__saveSession = function() {
    /// Check session is actually being used.
    if (this.Jet.app.get('useSession')) {
        var resSession  = JSON.stringify(self.__originalSession);
        var reqSession  = JSON.stringify(self.socket.req.session);

        /// Check if session changed...
        if (resSession !== reqSession) {
            var sid = this.Jet.app.get('sessionName') || 'connect.sid';
            try {
                var self = this;
                this.Jet.sessionStore.set(this.socket.cookies[sid], this.socket.req.session, function(err) {
                    if (err) {
                        self.Jet.log(err);
                    }
                });
            } catch (e) {
                this.Jet.log(e);
            }
        }
    }
};

/**
 * Not available with socket connections.
 * Methods defined because of compatibility.
 */
SocketResponse.prototype.append = function(header, value) { };
SocketResponse.prototype.attachment = function(filename) { };
SocketResponse.prototype.cookie = function(name, value, options) { };
SocketResponse.prototype.clearCookie = function(name, options) { };
SocketResponse.prototype.download = function(path, filename, fn) { };
SocketResponse.prototype.format = function(object) { };
SocketResponse.prototype.get = function(field) { };
SocketResponse.prototype.links = function(links) { };
SocketResponse.prototype.location = function(path) { };
SocketResponse.prototype.redirect = function(status, path) { };
SocketResponse.prototype.sendFile = function(path, options, fn) { };
SocketResponse.prototype.sendStatus = function(statusCode) { };
SocketResponse.prototype.set = function(field, value) { };
SocketResponse.prototype.status = function(code) { };
SocketResponse.prototype.type = function(type) { };
SocketResponse.prototype.vary = function(field) { };
SocketResponse.prototype.setHeader = function() { };
SocketResponse.prototype.writeHead = function() { };
SocketResponse.prototype.write = function() { };
