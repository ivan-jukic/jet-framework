/**
 * This object reads classes from the classes directory, and makes them available
 * in the controllers by calling Jet.factory.get("class path relative to classes directory");
 * @type {{classes: {}}}
 */
module.exports = Factory = {};


Factory.initObjectFactory = function(next) {
    var self = this;
    var fs = require('fs');
    var classesDir = this.dir.app + this.app.get('classesDirectory');

    this.factory = {
        classPaths  : {},
        classes     : {}
    };

    if (fs.existsSync(classesDir)) {
        this.utils.readDirRecursive(classesDir, function(err, tree) {
            /// Parse tree files...
            Factory.parseDirectoryStructure.call(self, tree, classesDir);
            /// Call next in line...
            next();
        });
    } else {
        next();
    }


    /**
     * Global factory, creates new instances for objects.
     * @type {{get: Function}}
     */
    this.factory.get = function(name) {
        var i, firstArg = true, args = [];

        for (i in arguments) {
            if (firstArg) {
                firstArg = false;
                continue;
            }

            args.push(arguments[i]);
        }

        if (self.factory.classPaths[name]) {
            if (!self.factory.classes[name]) {
                self.factory.classes[name] = require(self.factory.classPaths[name]);
            }

            /// Create new instance for this class.
            /// This solution will work for any class
            /// independent of the number of arguments.

            /// Take the constructor for our object.
            var constructor = self.factory.classes[name];

            /// Create temp constructor.
            var tempConstructor = function() {};

            /// Give our temp constructor the prototype of our main constructor (holds methods)
            tempConstructor.prototype = constructor.prototype;

            /// Initialize new temp constructor.
            var instance = new tempConstructor();

            /// Call the original constructor with instance as its context.
            /// This will populate the instance with arg values.
            var ret = constructor.apply(instance, args);

            /// If an object has been returned as a result of the previous
            /// operation, then return it. Otherwise return the original
            /// instance. This behaviour is the same as using "new" operator.
            var object = Object(ret) === ret ? ret : instance;

            /// Reference to framework...
            object.Jet = self;
            return object;
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
Factory.parseDirectoryStructure = function(tree, path) {
    var i;
    /// Get the files...
    if (tree.__files__) {
        for (i in tree.__files__) {
            this.factory.classPaths[ tree.__files__[i].replace(/(\.js)Jet/g, "") ] = path + "/" + tree.__files__[i];
        }
    }
    for (i in tree) {
        if ("__files__" === i) {
            continue;
        }
        /// Go in another level...
        Factory.parseDirectoryStructure.apply(this, [tree[i], path + "/" + i]);
    }
};