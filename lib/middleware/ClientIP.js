/**
 * Read client IP address and add it to the request object.
 * @type {Function}
 */
exports = module.exports = function ClientIP() {
    var jet = this;
    return function ClientIP(req, res, next) {
        try {
            req.__ip = jet.utils.getClientIPFromRequest(req);
        } catch (e) {
            /// TODO: better error handling...
            jet.log(e);
            req.__ip = 'unknown';
        }

        req.getClientIP = function() {
            return req.__ip;
        };

        next();
    };
};