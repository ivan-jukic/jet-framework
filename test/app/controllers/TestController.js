module.exports = TestController = function() {
    this.inherit = {BaseTestController: 'controllers/BaseTestController'};
};

/// Just for inheritance testing on ControllerFactory
TestController.prototype.mainMethod = function() {
    return true;
};

TestController.prototype.default = function() {
    this.end("OK");
};

TestController.prototype.testNormal = function() {
    this.send();
};

TestController.prototype.testAltTemplate = function() {
    this.setAltTemplate('alt/altTemplate');
    this.send();
};

TestController.prototype.testParams = function(param1, param2) {
    this.json({
        paramOne: param1,
        paramTwo: param2
    });
};

TestController.prototype.getVerbTest = function() {
    this.json({verb: 'get'});
};

TestController.prototype.postVerbTest = function() {
    this.json({verb: 'post'});
};

TestController.prototype.multiVerbTest = function() {
    this.end(this.req.method.toLowerCase());
};

TestController.prototype.getOtherRoute = function() {
    this.res.end("OTHER");
};