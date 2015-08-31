/**
 * Module which initializes Express.js framework.
 * @type {Function}
 */
module.exports = Configuration = {
    configName : "/config.js",
    defaultConfigName : "/default.config.js"
};

/**
 * @param next - next initialization method
 * @returns {boolean}
 */
Configuration.initConfigurationAndExpress = function(next) {

    /// Initialize express framework, create an app.
    this.app = require("express")();

    /// Set project name from the directory...
    this.app.set('projectName', this.dir.app.split("/").slice(-1)[0]);

    /// Initialize configuration and call next boot method.
    Configuration.loadServerAndAppConfigurations.call(this, next);
};

/**
 * Load app configuration. Developers may set any configuration option
 * in the app configuration, which is defined in the framework config
 * file, and also define config options for their app. If framework
 * config option is not define in the app config, default value is taken
 * from the framework default config.
 */
Configuration.loadServerAndAppConfigurations = function(next) {
    var fs = require('fs');
    var appConfig = null;
    var fwkConfigFile = this.dir.jet + Configuration.defaultConfigName;
    var appConfigFile = this.dir.app + Configuration.configName;
    var defaultAppConfigFile = this.dir.app + Configuration.defaultConfigName;
    var config = require(fwkConfigFile); /// Read default server config file...

    /// Check config files...
    _checkAppDefaultConfigFile.call(this);

    /// Copy default server configuration as default app configuration if default app config does not exist.
    function _checkAppDefaultConfigFile() {
        if (!fs.existsSync(defaultAppConfigFile)) {
            var self = this;
            this.utils.copyFile(fwkConfigFile, defaultAppConfigFile, function(err) {
                if (err) {
                    throw new Error(err);
                }  else {
                    _checkAppConfigFile.call(self);
                }
            });
        } else{
            _checkAppConfigFile.call(this);
        }
    }

    /// Check if config file for the app is available. If not, and default app config file is available, copy it!
    function _checkAppConfigFile() {
        if (!fs.existsSync(appConfigFile) && fs.existsSync(defaultAppConfigFile)) {
            var self = this;
            this.utils.copyFile(defaultAppConfigFile, appConfigFile, function(err) {
                if (err) {
                    throw new Error(err);
                } else {
                    _loadConfigurations.call(self);
                }
            });
        } else {
            _loadConfigurations.call(this);
        }
    }

    function _loadConfigurations() {
        var i;
        if (fs.existsSync(appConfigFile)) {
            /// Read App configuration file...
            appConfig = require(appConfigFile);

            for (i in appConfig) {
                config[i] = appConfig[i];
            }
        }

        /// Register configuration params.
        for (i in config) {
            this.app.set(i, config[i]);
        }

        /// Next call...
        next();
    }
};