var Jet = require("./core/JetServer.js");
var jetApp = new Jet({
    jetDir : process.cwd(),
    appDir : process.cwd() + '/test/app'
});
jetApp.run();