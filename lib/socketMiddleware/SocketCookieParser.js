exports = module.exports = function() {
    var Jet = this;
    return function(socket, next) {
        try {
            var cookie = require(Jet.dir.jet + "/node_modules/cookie-parser/node_modules/cookie");
            var parse = require(Jet.dir.jet + "/node_modules/cookie-parser/lib/parse");
        } catch (e) {
            Jet.log(e);
        }

        var secret  = Jet.app.get('sessionSecret');
        /// Parse cookies...
        socket.cookies = cookie.parse(socket.handshake.headers.cookie);

        /// Un-sign session cookie...
        if (secret) {
            socket.signedCookies = parse.signedCookies(socket.cookies, secret);
            socket.signedCookies = parse.JSONCookies(socket.signedCookies);

            for (var key in socket.signedCookies) {
                socket.cookies[key] = socket.signedCookies[key];
            }
        }

        /// Parse cookie values in json object (if there are any)...
        socket.cookies = parse.JSONCookies(socket.cookies);

        /// Set cookies in request and response objects...
        socket.req.setCookies(socket.cookies);

        ///...
        next();
    }
};
