/**
 * Controller factory is responsible to create new
 * controllers when a request is received. It will
 * also populate controller with necessary properties
 * to provide some commonly used functions easily
 * available to the developers.
 */
module.exports = JetControllerFactory = function() {

};

/**
 * This method is used to manufacture new controllers. Each controller is
 * defined by response and request object, and by its name. For each
 * controller req, res, and __objectName properties are created,
 * which cannot be set anywhere else but here on initialization.
 * @param Jet
 * @param objName
 * @param req
 * @param res
 * @returns {object}
 */
JetControllerFactory.prototype.manufacture = function(Jet, objName, req, res)
{
    var controllerPath = Jet.dir.app + "/controllers/" + objName + ".js";

    /// Controller objects...
    var controllerObject = require(controllerPath);

    /// Initialize new controller and cache objects...
    var ctlInstance = new controllerObject();
    var defaultPropertyConf = {
        configurable: true,
        enumerable: true,
        writable: false
    };

    /// Fix object name...
    objName = objName.split('/').slice(-1)[0];

    /// Set value and setter for req property.
    Object.defineProperty(ctlInstance, 'Jet', Jet.utils.extend(defaultPropertyConf, {value : Jet}));
    Object.defineProperty(ctlInstance, 'req', Jet.utils.extend(defaultPropertyConf, {value : req}));
    Object.defineProperty(ctlInstance, 'res', Jet.utils.extend(defaultPropertyConf, {value : res}));
    Object.defineProperty(ctlInstance, '__objectName', Jet.utils.extend(defaultPropertyConf, {value : objName}));

    /// Inherit...
    Jet.utils.inherit.call(ctlInstance);

    /// Return generated controller object...
    return ctlInstance;
};
