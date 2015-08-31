modules = module.exports = function() {
    var Jet = this;
    return function(socket, next) {
        try {
            var _req = require(Jet.app.get('cwd') + "/lib/websocket/SocketRequest");
            var _res = require(Jet.app.get('cwd') + "/lib/websocket/SocketResponse");
        } catch (e) {
            Jet.log(e);
        }

        /// Initialize request and response objects...
        socket.req  = new _req(socket);
        socket.res  = new _res(socket);

        /// Set socket request properties
        socket.req.Jet = Jet;
        socket.req.app = Jet.app;
        socket.req.headers = socket.handshake.headers;

        socket.res.Jet = Jet;
        socket.res.app = Jet.app;

        /// Next function in middleware...
        next();
    }
};
