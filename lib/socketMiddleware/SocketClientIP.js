exports = module.exports = function ClientIP() {
    var Jet = this;
    return function SocketClientIP(socket, next) {
        try {
            var ip = Jet.utils.getClientIPFromRequest(socket.handshake);
        } catch (e) {
            Jet.log(e);
            return;
        }

        socket.req.ip = ip;
        next();
    };
};