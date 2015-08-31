/**
 * This is the main controller. All the requests go through an instance of this object.
 * Jet parameter is a reference to the framework, so that the framework instance is
 * available to all the methods in the controller.
 * @param Jet
 * @constructor
 */
module.exports = JetController = function(Jet) {
    this.Jet = Jet;
    this.res = null;
    this.req = null;
    this.ctl = null;
    this.method = null;
};

/**
 * Main method which receives a request, initializes the correct controller
 * @param req
 * @param res
 * @param ctl
 * @param method
 * @returns {number}
 */
JetController.prototype.process = function(req, res, ctl, method) {
    var self = this;
    self.req = req;
    self.res = res;
    self.ctl = ctl;
    self.method = method;

    /// Get controller...
    this._getControllerObject(function(err, instance) {
        if (err) {
            self.onControllerError(err);
        } else {
            self._validateController(instance, function(err) {
                if (err) {
                    /// Log error...
                    this.Jet.log(err);
                    self.onControllerError(err);
                } else {
                    var params = instance.req.params || {}, paramsArr = [];
                    for (var i in params) {
                        paramsArr.push(params[i]);
                    }

                    /// Check if controller has construct function defined.
                    if ('function' === typeof instance._construct) {
                        /// Controller has constructor, call it...
                        instance._construct(function() {
                            try {
                                instance[self.method].apply(instance, paramsArr);
                            } catch(e) {
                                self.onControllerError(e);
                            }
                        });
                    } else {
                        /// Controller does not have constructor...
                        try {
                            instance[self.method].apply(instance, paramsArr);
                        } catch(e) {
                            self.Jet.log(e.stack);
                            self.onControllerError(e);
                        }
                    }
                }
            });
        }
    });
};

/**
 * Initializes controller factory and produces controller instance.
 * @param cb
 * @private
 */
JetController.prototype._getControllerObject = function(cb) {
    /// Initialize new controller factory...
    var ControllerFactoryObject = require(this.Jet.dir.jet + '/core/JetControllerFactory.js');
    var factory = new ControllerFactoryObject();

    /// Try to create a controller object!
    try {
        var o = factory.manufacture(this.Jet, this.ctl, this.req, this.res);
        cb(false, o);
    } catch (e) {
        /// If error occurred during controller initialization.
        cb(e, null);
    }
};


/**
 * Validates controller object, checks to make sure that the method we need to call is there.
 * @param instance
 * @param cb
 * @private
 */
JetController.prototype._validateController = function(instance, cb) {
    var self = this;
    try {
        /// Check if method exists... If not exception will be thrown.
        _checkControllerMethod();
    } catch(e) {
        cb(e);
        return;
    }

    /// No error occurred...
    cb(false);

    function _checkControllerMethod() {
        /// Check if our controller has method which needs to be fired!
        if ("function" !== typeof instance[self.method]) {
            throw new Error("Controller <" + self.ctl + "> does not have the method > " + self.method);
        }
    }
};


/**
 * Wrapper for base object error method...
 * @param e
 * @returns {number}
 */

JetController.prototype.onControllerError = function(e) {

    /// TODO: for dev environment display error (return to the browser), for production env return 404 with error cookie

    /// Respond with error...
    this.Jet.log(e);
    this.res.send(e);
};