/**
 * Module which reads command line arguments and sets them in the app configuration.
 *
 * TODO: add support for multiple command line argument options
 *
 * @type {Function}
 */
module.exports = Arguments = {};

/**
 * Read command line arguments...
 * @returns {*}
 */
Arguments.readCommandLineArguments = function(next) {
    /// Checks arguments passed as an object to the framework object.
    if (this.arguments && this.arguments.port) {
        /// Set arguments array, first two parameters are always the same...
        return Arguments.checkArguments.apply(this, [{'0' : 'node', '1' : 'index', '2' : this.arguments.port}, function() {
            next();
        }]);
    } else {
        /// Get arguments from the command line...
        Arguments.checkArguments.apply(this, [process.argv, function() {
            next();
        }]);
    }
};

/**
 * Checks the number of arguments.
 * @param argv
 * @param cb
 * @returns {*}
 */
Arguments.checkArguments = function(argv, cb) {
    if (argv.length < 3) {
        throw new Error("Not enough arguments. Start like this \n\n\t\"node <index_script> <port_number>\"");
    } else {
        Arguments.checkArgumentsPort.apply(this, [argv, cb]);
    }
};

/**
 * Checks if the port number is valid.
 * @param argv
 * @param cb
 * @returns {*}
 */
Arguments.checkArgumentsPort = function(argv, cb) {
    var port = parseInt(argv[2]);
    if (isNaN(port) || port > 65535) {
        throw new Error("Port must be a number, and it must be less or equal to 65535!");
    } else {
        process.env.PORT = parseInt(argv[2]);
        cb();
    }
};
