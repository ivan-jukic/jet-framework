var BaseTestController = function()
{
    this.__objectName = "BaseTestController";

    BaseTestController.prototype.baseMethod = function() {
        return true;
    };
};

module.exports = BaseTestController;