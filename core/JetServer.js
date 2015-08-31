/**
 * This is the main jet-framework object. Creating an instance of this
 * object only initializes the environment. Server initialization, and
 * connections to other systems are established only after "run" method
 * is called.
 *
 * TODO: add events to this class, and the events would be fired at specific points during the app boot
 *
 * @params arguments - values which will be used to bootstrap the app.
 * Used primarily for testing or for some specific usages of the framework.
 */
module.exports = JetServer = function(arguments) {
    this.dir = {
        jet : process.cwd() + "/node_modules/jet-framework",    /// expected location of the framework
        app : process.cwd()
    };
    this.arguments = null;
    this.app = null;
    this.server = null;
    this.eventHandlers = {};
    this.events = ['onServerStart', 'onServerStop'];

    /// Check if the arguments are set and check if the directories are set.
    /// By setting custom directories to work with, we can have different
    /// directory structure, eg. when testing.
    if (arguments) {
        this.arguments = arguments;
        if (arguments.jetDir) {
            this.dir.jet = arguments.jetDir;
        }
        if (arguments.appDir) {
            this.dir.app = arguments.appDir;
        }
    }

    /// Get utilities and set them as a part of this object!
    this.utils = require(this.dir.jet + '/utils/Utility.js');

    /// Load framework package data and store the info for easier access.
    this.package = {
        fwk : require(this.dir.jet + '/package.json')
    };
};


/**
 * Method which starts the framework. Here we are immediately taking
 * values for directory paths from the arguments because they are important
 * for further initialization.
 */
JetServer.prototype.run = function() {

    /// Initialize environment!
    var setupModules = [
        'Arguments::readCommandLineArguments',
        'Configuration::initConfigurationAndExpress',
        'Middleware::initMiddleware',
        'Routing::initRouting',
        'Factory::initObjectFactory',
        'Service::initServices',
        'Cache::initRedisConnection',
        'Server::initServer'
    ];

    /// Iterate over the initialization modules and call their methods.
    this.__boot(setupModules, 0);

    return this;
};

/**
 * The initializer method reads initialization order of modules in
 * the framework, and executes them, while waiting for the module
 * to call next method before new module is initialized.
 * @param bootModules
 * @param moduleIndex
 * @private
 */
JetServer.prototype.__boot = function(bootModules, moduleIndex) {
    if (moduleIndex >= bootModules.length) {
        return;
    }

    var self = this;
    var params = bootModules[moduleIndex].split("::");
    var module = require(this.dir.jet + "/boot/" + params[0]);
    var method = params[1];

    if ('function' !== typeof module[method]) {
        throw new Error("Framework bootstrap failed: unknown initialization parameters '" + bootModules[moduleIndex] + "'");
    } else {
        /// Call method...
        module[method].call(self, function() {
            /// This is a callback function, which will call next initializer in queue through a recursive call.
            self.__boot(bootModules, ++moduleIndex);
        });
    }
};


/**
 * Method used to release all the resources
 * and exit the application. Useful with testing.
 * @param exitProcess
 * @param cb
 */
JetServer.prototype.shutdown = function(exitProcess, cb) {
    var self = this;

    if ('function' === typeof exitProcess) {
        cb = exitProcess;
        exitProcess = false;
    }

    /// Close redis cache connection.
    if (this.redis) {
        this.redis.end();
    }

    /// Close session redis connection.
    if (this.app.get('useRedisSession')) {
        if (this.sessionSettings) {
            if (this.sessionSettings.store) {
                if (this.sessionSettings.store.client) {
                    this.sessionSettings.store.client.end();
                }
            }
        }
    }

    /// Shutdown server...
    this.server.close(function() {
        /// Fire on server listen event handlers in framework context.
        for(var i in self.eventHandlers['onServerStop']) {
            self.eventHandlers['onServerStop'][i].call(self);
        }

        if ('function' === typeof cb) {
            cb.call(this);
        }

        self.log('server closed');
        /// Exit process...
        if (exitProcess) {
            process.exit(0);
        }
    });
};

/**
 * Simple add event listener!
 * TODO: add namespaces for events
 * @param eventName
 * @param eventHandler
 */
JetServer.prototype.addEventListener = function(eventName, eventHandler) {
    /// Check that the event is allowed
    if (this.events.indexOf(eventName) > -1) {
        if (!Array.isArray(this.eventHandlers[eventName])) {
            this.eventHandlers[eventName] = [];
        }
        /// Register new event handler...
        this.eventHandlers[eventName].push(eventHandler);
    }
};

/**
 * Clear all event listeners for specific event name.
 * TODO: add method to remove specific events, all or based on namespace
 * @param eventName
 */
JetServer.prototype.clearEventListeners = function(eventName) {
    if (Array.isArray(this.eventHandlers[eventName])) {
        this.eventHandlers[eventName] = [];
    }
};

/**
 * Create new method for console logging. This way we can have better control over our console output.
 */
JetServer.prototype.log = function() {
    if (this.app && this.app.get('useConsoleLogging')) {
        var args = [];
        for (var i in arguments) {
            args.push(arguments[i]);
        }
        if (args[0] && args[0].stack) {
            console.log(args[0].stack);
        } else {
            console.log.apply(console.log, args);
        }
    }
};
