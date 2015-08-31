/**
 * Object which implements loading of the services. Services are objects which are instantiated
 * only once and they keep their state (singletons). This object will read services from the
 * services directory, and save their paths. When a service is requested, an instance from the
 * memory is loaded, if there is no instance, a new one is created.
 * @type {{}}
 */
module.exports = Service = {};
    
    
Service.initServices = function(next) {
    var self = this;
    var fs = require('fs');
    var servicesPath = this.dir.app + this.app.get('servicesDirectory');

    this.service = {
        serviceObjectPaths : {},
        serviceInstances : {}
    };

    if (fs.existsSync(servicesPath)) {
        this.utils.readDirRecursive(servicesPath, function(err, tree) {
            /// Parse tree files...
            Service.parseDirectoryStructure.apply(self, [tree, servicesPath]);
            /// Call next in line...
            next();
        });
    } else {
        /// No services directory...
        next();
    }

    /**
     * Initialize service global object, and define a
     * function to get a service object required.
     * Services are initialized only once, and used
     * as a singleton.
     * @type {{get: Function}}
     */
    this.service.get = function(name) {
        if (self.service.serviceObjectPaths[name]) {
            if (!self.service.serviceInstances[name]) {
                var object = require(self.service.serviceObjectPaths[name]);

                /// Create service instance...
                self.service.serviceInstances[name] = new object();

                /// Reference to framework
                self.service.serviceInstances[name].Jet = self;
            }

            /// Return service instance...
            return self.service.serviceInstances[name];
        } else {
            return null;
        }
    };
};


/**
 * Recursive way to parse the results into an object
 * with individual files, and file names as indices.
 * @param tree
 * @param path
 */
Service.parseDirectoryStructure = function(tree, path) {
    var i;
    /// Get the files...
    if (tree.__files__) {
        for (i in tree.__files__) {
            this.service.serviceObjectPaths[ tree.__files__[i].replace(/(\.js)$/g, "") ] = path + "/" + tree.__files__[i];
        }
    }

    for (i in tree) {
        if ("__files__" === i) {
            continue;
        }
        /// Go in another level...
        Service.parseDirectoryStructure.apply(this, [tree[i], path + "/" + i]);
    }
};