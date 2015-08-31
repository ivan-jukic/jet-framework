/**
 * Returns md5 hash of the data string...
 * @param {string} data
 * @returns {string}
 */
exports.md5 = function(data) {
    return Jet.nm.crypto.createHash('md5').update(data).digest('hex')
};

/**
 * Returns sha1 hash of the data string...
 * @param {string} data
 * @param {string} encoding
 * @param {string} digest
 * @returns {string}
 */
exports.sha1 = function(data, encoding, digest) {
    var enc = typeof encoding === 'undefined' ? 'utf8' : encoding;
    var dig = typeof digest === 'undefined' ? 'hex' : digest;
    return Jet.nm.crypto.createHash('sha1').update(data, enc).digest(dig);
};

/**
 * Creates a copy of the source file in the given destination.
 * @param src
 * @param dest
 * @param cb
 */
exports.copyFile = function(src, dest, cb) {
    var fs = require("fs");
    var cbCalled = false;

    var rd = fs.createReadStream(src);
    rd.on("error", function(err) {
        done(err);
    });

    var wr = fs.createWriteStream(dest);
    wr.on("error", function(err) {
        done(err);
    });

    wr.on("close", function(ex) {
        done();
    });

    rd.pipe(wr);

    function done(err) {
        if (!cbCalled && 'function' === typeof cb) {
            cb(err);
            cbCalled = true;
        }
    }
};

/**
 * Method used for reading through a directory. This method is async.
 * @param dir
 * @param cb
 */
exports.readDirRecursive = function(dir, cb) {
    var fs = require('fs');
    var obj = {
        struct : {},
        readCount: 1
    };

    _readDir.call(obj, dir, 1);

    function _readDir(dir, depth) {
        var self = this;
        fs.readdir(dir, function(err, files) {
            if (!err) {
                var path, statsCalls = files.length;

                if (files.length) {
                    for (var i in files) {
                        path = dir + "/" + files[i];

                        _getFileStats.call(self, path, files[i], depth, function() {
                            if (0 === --statsCalls) {
                                if (0 === --self.readCount) {
                                    cb(false, self.struct);
                                }
                            }
                        });
                    }
                } else {

                    /// No files available...
                    cb(false, self.struct);
                }
            } else {
                cb(err, null);
            }
        });
    }

    function _getFileStats(path, file, depth, cb2) {
        var self = this;
        var pathParts = path.split("/");
        var indices = pathParts.splice(pathParts.length - depth, depth - 1);    /// Omit the last item, it is file

        fs.stat(path, function(err, stats) {
            if (!err) {
                if (stats.isDirectory()) {
                    self.readCount++;
                    _readDir.call(self, path, ++depth);
                    self.struct = _recursiveSetFile.call(self, true, file, indices, self.struct);
                } else if (stats.isFile()) {
                    self.struct = _recursiveSetFile.call(self, false, file, indices, self.struct);
                }
                cb2();
            } else {
                cb(err, false);
            }
        });

        function _recursiveSetFile(isDir, file, properties, obj, idx) {
            if ('undefined' === typeof idx) {
                idx = 0;
            }
            if (idx <= properties.length - 1) {
                var res = _recursiveSetFile(isDir, file, properties, obj[properties[idx]], idx + 1);
                obj[properties[idx]] = res;
                return obj;
            } else {
                if (isDir) {
                    obj[file] = {};
                } else {
                    if ('undefined' === typeof obj['__files__']) {
                        obj['__files__'] = [];
                    }
                    obj['__files__'].push(file);
                }

                return obj;
            }
        }
    }
};

/**
 * Read request and set
 * @param reqObj
 * @returns {null}
 */
exports.getClientIPFromRequest = function(reqObj) {
    var i, IP;
    var localhostIP = '127.0.0.1';
    var substituteIP = this.getMachineNetworkIPv4();
    var forwardedHeaders = ['x-forwarded-for', 'x-real-ip'];

    IP = localhostIP;
    if (!reqObj.isSocketRequest()) {
        for (i = 0; i < forwardedHeaders.length; i++) {
            if ('undefined' !== typeof reqObj.headers[ forwardedHeaders[i] ]) {
                IP = reqObj.headers[ forwardedHeaders[i] ];
            }
        }
    } else {
        if ('undefined' !== typeof reqObj.address) {
            IP = reqObj.address.address;
        }
    }

    return IP === localhostIP ? substituteIP : IP;
};

/**
 * Get ipv4 address of the machine on the local network.
 * @param pInterface
 * @returns {null}
 */
exports.getMachineNetworkIPv4 = function(pInterface) {
    return this.getMachineNetworkIP('IPv4', pInterface);
};

/**
 * Get ipv6 address of the machine on the local network.
 * @param pInterface
 * @returns {null}
 */
exports.getMachineNetworkIPv6 = function(pInterface) {
    return this.getMachineNetworkIP('IPv6', pInterface);
};

/**
 * Returns IP address...assumption, single IP of type is binded on network interface...
 *
 * @param version
 * @param pInterface
 * @returns {null}
 */
exports.getMachineNetworkIP = function(version, pInterface) {
    var os = require('os');
    var interfaces = os.networkInterfaces();
    var addresses = [];
    var address, i;

    if ('undefined' !== typeof pInterface) {
        if ('undefined' === typeof interfaces[pInterface]) {
            return null;
        } else {
            /// If we only want IP address of single interface (eg. eth0, wlan0...)
            /// then we only take that interface and read IP address from it...
            interfaces = interfaces[pInterface];
            if (Array.isArray(interfaces)) {
                for (i=0; i < interfaces.length; i++) {
                    address = interfaces[i];
                    if (address.family === version && !address.internal) {
                        adresses.push(address.address);
                    }
                }

                if (adresses.length === 1) {
                    return addresses[0];
                } else if (addresses.length > 1) {
                    return addresses;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    } else {
        for (i in interfaces) {
            for (j in interfaces[i]) {
                address = interfaces[i][j];
                if (address.family == version && !address.internal) {
                    addresses.push(address.address)
                }
            }
        }
        if (addresses.length > 0) {
            if (pInterface) {
                return addresses;
            } else {
                return addresses[0];
            }
        } else {
            return null;
        }
    }
};

/**
 * Function used for object inheritance. It copies properties and methods from
 * one object to another, thus causing them to have the same functionality.
 * If property with the same name is found, then target property value
 * overwrites value from source object, but if method is found then it is copied
 * to special "parent" object.
 * @returns {undefined}
 */
exports.inherit = function() {
    var o, i;
    var self = this;
    var currObj = this;
    var inheritObjects = []; /// List of objects from which to inherit and jet base object...
    var jetBaseController = require(this.Jet.dir.jet + '/core/JetBaseObject.js');

    /// Add Base object as first one...
    inheritObjects.push(new jetBaseController());

    /// Generate inherit objects list...
    getInheritList(currObj);

    /// Generate inherit objects list...
    function getInheritList(currentInst) {
        var obj, inst;
        if (!currentInst.inherit) {
            return 0;
        } else {
            for (var i in currentInst.inherit) {
                obj = require(self.Jet.dir.app + "/" + currentInst.inherit[i]);
                inst = new obj();
                if (inst.inherit) {
                    getInheritList(inst);
                }

                inheritObjects.push(inst);
            }
        }
        return 0;
    }

    /// Initialize object that will inherit ...
    o = inheritObjects[0];

    /// Copy properties and methods from inherited objects!
    if (inheritObjects.length) {
        /// Iterate over object with inherit references..
        for (i = 1; i < inheritObjects.length; i++) {
            o = __inheritCall(inheritObjects[i], o);
        }

        /// Extend this object...
        __inheritCall(self, o);
    }

    function __inheritCall(target, source) {
        target.__parent = source;
        for (var i in source) {
            if ('undefined' === typeof target[i]) {
                target[i] = source[i];
            }
        }
        return target;
    }
};

/**
 * Extends object 1 with object 2 properties.
 * @param object1
 * @param object2
 * @param extendType
 */
exports.extend = function(object1, object2, extendType) {
    /// If the type of the object that should
    /// extend default object is not 'object'
    /// just return that value.
    if ('object' !== typeof object2 && 'undefined' !== typeof object2) {
        return object2;
    }

    for(var i in object2) {
        if ('function' === extendType) {
            if ('function' === typeof object2[i] && !object1[i]) {
                object1[i] = object2[i];
            }
        } else {
            object1[i] = object2[i];
        }
    }
    return object1;
};

/**
 * Copy object, makes a shallow copy...
 * @param object
 * @returns {*}
 */
exports.copyObject = function(object) {
    return this.extend({}, object);
};