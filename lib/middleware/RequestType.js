exports = module.exports = function RequestType() {
    var Jet = this;
    return function RequestType(req, res, next) {

        req.__isAjax = false;
        req.__isAPI = false;
        req.isAjax = function() { return req.__isAjax; };
        req.isAPI = function() { return req.__isAPI; };
        
        /// Socket request and response.
        req.isSocketRequest = function() { return false; };
        res.isSocketResponse = function() { return false; };


        if ('undefined' !== typeof req.headers['x-requested-with']) {
            if ('xmlhttprequest' === req.headers['x-requested-with'].toLowerCase()) {
                req.__isAjax = true;
            }
        }

        if ('undefined' !== typeof req.headers['x-jet-api-request']) {
            if ('true' === req.headers['x-jet-api-request']) {
                req.__isAPI = true;
            }
        }

        next();
    };
};