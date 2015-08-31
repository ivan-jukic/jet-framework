module.exports = function() {
    var Jet = require("./core/JetServer.js");
    var jetApp = new Jet();
    return jetApp.run();
};
