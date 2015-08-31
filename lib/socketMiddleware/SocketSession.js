exports = module.exports = function() {
    var Jet = this;
    return function(socket, next) {
        /// Check that session is enabled...
        if (Jet.app.get('useSession')) {
            var sid = Jet.app.get('sessionName') || 'connect.sid';
            if (socket.cookies && socket.cookies[sid]) {

                /// Load socket data...
                Jet.sessionStore.get(socket.cookies[sid], function(err, session) {
                    if (err) {
                        console.echo(err);
                    } else {
                        socket.req.setSession(session);
                        socket.res.setSession(session);
                    }
                    next();
                });
            } else {
                next();
            }
        } else {
            next();
        }
    }
};