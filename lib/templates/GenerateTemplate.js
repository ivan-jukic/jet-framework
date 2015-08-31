/**
 * Class used for compiling templates and sending them to the client.
 * @type {Function}
 */
module.exports = GenerateTemplate = function(Jet, innerTemplate, outerTemplate) {
    this.Jet = Jet;
    this.innerTemplate = innerTemplate ? innerTemplate : null;
    this.outerTemplate = outerTemplate ? outerTemplate : null;
};

/**
 * Method which will render full html (inner and outer);
 * @param innerValues
 * @param outerValues
 * @param cb
 */
GenerateTemplate.prototype.renderFullHtml = function(innerValues, outerValues, cb) {
    var self = this;
    self.renderInnerHtml(innerValues, function(err, html) {
        if (err) {
            /// Error occurred while rendering inner template
            /// so return what happened.
            cb(err, html);
        } else {
            self.renderOuterHtml(html, outerValues, function(err, html) {
                cb(err, html);
            });
        }
    });
};

/**
 * Render only inner html. This function is used when we
 * want to render full html or return just ajax response.
 * @param innerValues
 * @param cb
 * @private
 */
GenerateTemplate.prototype.renderInnerHtml = function(innerValues, cb) {
    if ('function' === typeof innerValues) {
        cb = innerValues;
        innerValues = {};
    }
    var self = this;
    this.__getTemplate(this.__getInnerTemplateSettings(), function(err, fn) {
        if (err) {
            cb(err, null);
        } else {
            /// Allow access to global object from templates.
            /// It will allow reading of config and getting routes.
            innerValues["Jet"] = self.Jet;
            cb(false, fn(innerValues));
        }
    });
};

/**
 * Method which will render outer html. First argument is inner html which will be
 * added to the template and is html. Other values that should be used in outer
 * template are in outer values argument.
 * @param innerHtml
 * @param outerValues
 * @param cb
 */
GenerateTemplate.prototype.renderOuterHtml = function(innerHtml, outerValues, cb) {
    if ('function' === typeof outerValues) {
        cb = outerValues;
        outerValues = null;
    }

    /// If outer values are not set..
    if (!outerValues) {
        outerValues = {};
    }

    /// Add html to outer values...
    outerValues.html = innerHtml;
    var self = this;
    this.__getTemplate(this.__getOuterTemplateSettings(), function(err, fn) {
        if (err) {
            cb(err, null);
        } else {
            /// Allow access to global object from templates.
            /// It will allow reading of config and getting routes.
            outerValues["Jet"] = this.Jet;
            cb(false, fn(outerValues));
        }
    });
};

/**
 * Method which received template path, and checks if the template was compiled
 * and that it wasn't modified recently. If the template was not compiled or
 * it has been modified it will be re-compiled.
 * @param settings
 * @param cb
 * @private
 */
GenerateTemplate.prototype.__getTemplate = function(settings, cb) {
    var self = this;
    var path = settings.filename;
    var fs = require('fs');
    fs.stat(path, function(err, stats) {
        if (err) {
            cb(err, null);
        } else {
            if (self.Jet.jadeTemplates[path]
                && self.Jet.jadeTemplates[path].mtime.toJSON() === stats.mtime.toJSON()
                && 'dev' !== self.Jet.app.get('env')) {

                /// Template is set and modification time was not changed...
                cb(false, self.Jet.jadeTemplates[path].fn);
            } else {
                /// Compile the template...
                var fn = null;

                try {
                    fn = self.Jet.jade.compileFile(path, settings);
                } catch (e) {
                    self.Jet.log(e);
                    fn = false;
                    cb(e, function() {
                        return e.message;
                    });
                }

                if (fn) {
                    /// Set this template into templates object...
                    self.Jet.jadeTemplates[path] = {
                        fn: fn,
                        mtime: stats.mtime
                    };

                    /// Pass the compiled template function back.
                    cb(false, self.Jet.jadeTemplates[path].fn);
                }
            }
        }
    });
};

/**
 * This is a generic function which will render the template.
 * @param settings
 * @param cb
 * @private
 */
GenerateTemplate.prototype.__renderTemplate = function(settings, cb) {
    var self = this;
    var fs = require('fs');
    fs.exists(settings.filename, function (exists) {
        if (!exists) {
            /// Return error as first parameter, null as success/html...
            cb(new Error("template '" + settings.filename + "' was not found"), null);
        } else {
            self.Jet.jade.renderFile(settings.filename, settings, function (err, html) {
                if (err) {
                    /// Return error...
                    cb(err, null);
                } else {
                    /// File exists and was rendered successfully...
                    cb(false, html);
                }
            });
        }
    });
};

/**
 * Method takes inner page values, and creates object used to compile
 * the inner template.
 *
 * @param innerValues
 * @returns {Object}
 * @private
 */
GenerateTemplate.prototype.__getInnerTemplateSettings = function(innerValues) {
    var settings = this.__getGenericTemplateSettings(innerValues);

    /// Set inner template path ...
    settings.filename = this.innerTemplate;
    return settings;
};

/**
 * Method receives outer page values and creates a full object with template
 * reference which will be used in creation of the template.
 * @param outerValues
 * @returns {Object}
 * @private
 */
GenerateTemplate.prototype.__getOuterTemplateSettings = function(outerValues) {
    var settings = this.__getGenericTemplateSettings(outerValues);

    /// Set outer template path ...
    settings.filename = this.outerTemplate;
    return settings;
};


/**
 * Method takes some custom page values and creates an object with
 * those values, which is used to compile template.
 *
 * @param pageValues
 * @returns {{pretty: boolean, debug: boolean, compileDebug: boolean}}
 * @private
 */
GenerateTemplate.prototype.__getGenericTemplateSettings = function(pageValues) {
    var settings = {
        pretty: false,
        debug: false,
        compileDebug: false
    };

    /// Copy additional values...
    if ('object' === typeof pageValues) {
        settings = this.Jet.fn.extend(settings, pageValues);
    }

    /// If we are working in dev environment...
    if ('dev' === this.Jet.app.get('env')) {
        settings.pretty = true;
        settings.compileDebug = true;
    }

    /// ...
    return settings;
};
