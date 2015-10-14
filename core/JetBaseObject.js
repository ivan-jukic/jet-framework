module.exports = JetBaseObject = function() {
    this.viewsDir = 'views'; /// Directory in which templates are stored relative to the framework root dir.
    this.indexDir = 'views/common';
    this.innerTemplate = 'default'; /// Default inner/outer template...
    this.altInnerTemplate = null;
    this.outerTemplate = 'index';
    this.innerValues = {}; /// Inner/outer template values
    this.outerValues = {};
    this.__objectName = 'JetBaseObject';
    this.__disableOutput = false;
    this.__responseSent = false; /// If response is already sent, this flag will make sure that no other response is sent
};

/**
 * Name of the object. Since we cannot get name of the object in javascript
 * dynamically, we have to set names explicitly.
 * @returns {string}
 */
JetBaseObject.prototype.getObjectName = function() {
    return this.__objectName;
};

/**
 * Find the proper parent object, defined by his name.
 * @param parentName
 * @returns {*}
 */
JetBaseObject.prototype.getParent = function(parentName) {
    var parent = this.__parent;
    if ('undefined' === typeof parentName) {
        return parent;
    }

    /// While there are parents, search for the right one......
    while(parent) {
        if (parentName === parent.__objectName) {
            return parent;
        } else if (parent.__parent) {
            parent = parent.__parent;
        } else {
            parent = null;
        }
    }

    return null;
};

/**
 * Returns true if the request is socket request.
 * @returns {boolean|*}
 */
JetBaseObject.prototype.isSocketRequest = function() {
    return this.req.isSocket;
};

/**
 * Sockets emit events when they emit some data to the client.
 * Response event has a name, this function sets this name;
 * @param socketResponseName
 */
JetBaseObject.prototype.setSocketResponseName = function(socketResponseName) {
    if (this.res.isSocket) {
        this.res.responseName = socketResponsename;
    }
};

/**
 * Add value which will be passed to the inner template.
 * @param key
 * @param val
 */
JetBaseObject.prototype.addPageValue = function(key, val) {
    this.innerValues[key] = val;
};

/**
 * Value passed to outer template.
 * @param key
 * @param val
 */
JetBaseObject.prototype.addOuterPageValue = function(key, val) {
    this.outerValues[key] = val;
};

/**
 * Set headers that will be sent back to the client...
 * @param key
 * @param val
 */
JetBaseObject.prototype.setHeader = function(key, val) {
    this.res.set(key, val);
};

/**
 * Set status code for the response.
 * @param code
 */
JetBaseObject.prototype.setStatusCode = function(code) {
    if (!isNaN(parseInt(code))) {
        this.res.status(parseInt(code));
    }
};

/**
 * Returns key value from the session object!
 * @param key
 */
JetBaseObject.prototype.getSession = function(key) {
    if (this.req.session) {
        if ('undefined' === typeof key) {
            return this.req.session;
        }
        if (this.req.session[key]) {
            return this.req.session[key];
        }
    }
    return undefined;
};

/**
 * Method used to set value into the session.
 * @param key
 * @param value
 */
JetBaseObject.prototype.setSession = function(key, value) {
    if (this.req.session) {
        this.req.session[key] = value;
    }
};

/**
 * Set cookie.
 * @param name
 * @param value
 * @param options
 */
JetBaseObject.prototype.setCookie = function(name, value, options) {
        this.res.cookie(name, value, options);
};

/**
 * Clear cookie value.
 * @param name
 * @param options
 */
JetBaseObject.prototype.clearCookie = function(name, options) {
    this.res.clearCookie(name, options);
};

/**
 * Sometimes maybe we will want to get our jade templates
 * from a different directory. Using this function we
 * can set the path to that other directory.
 * @param newViewsDir
 */
JetBaseObject.prototype.setTemplatesDir = function(newViewsDir) {
    this.viewsDir = newViewsDir;
};

/**
 * Set name of the inner template...
 * @param templateName
 */
JetBaseObject.prototype.setTemplate = function(templateName) {
    this.innerTemplate = templateName;
};

/**
 * Sets alternative inner template. Alternative inner template
 * must be inside /views directory, and relative path must be
 * the value of the altTemplateName argument (relative to the
 * /views directory).
 * @param altTemplateName
 */
JetBaseObject.prototype.setAltTemplate = function(altTemplateName) {
    this.altInnerTemplate = altTemplateName;
};

/**
 * Get inner template, depending on if the alt template is set.
 * @returns {string}
 */
JetBaseObject.prototype.getTemplate = function() {
    return this.altInnerTemplate ? this.altInnerTemplate : this.innerTemplate;
};

/**
 * Return full template path to the inner template. If alt template is set,
 * that template will get rendered, else this controller template will get
 * rendered.
 *
 * @return {string}
 */
JetBaseObject.prototype.getInnerTemplatePath = function() {
    var appDir = this.Jet.dir.app;
    if (this.altInnerTemplate) {
        return appDir + "/" + this.viewsDir + "/" + this.altInnerTemplate + ".jade";
    } else {
        return appDir + "/" + this.viewsDir + "/controllers/" + this.__objectName + "/" + this.innerTemplate + ".jade";
    }
};

/**
 * Name of the outer template...
 * @param templateName
 */
JetBaseObject.prototype.setOuterTemplate = function(templateName) {
    this.outerTemplate = templateName;
};

/**
 * Get outer template value...
 * @returns {string}
 */
JetBaseObject.prototype.getOuterTemplate = function() {
    return this.outerTemplate;
};

/**
 * Get full path to outer template. Outer templates
 * should be in /views/common directory.
 * @returns {string}
 */
JetBaseObject.prototype.getOuterTemplatePath = function() {
    return this.Jet.dir.app + "/" + this.indexDir + "/" + this.outerTemplate + ".jade";
};

/**
 * Disable output. If output is disabled, on respond
 * method call, empty response will be returned.
 */
JetBaseObject.prototype.disableOutput = function() {
    this.__disableOutput = true;
};

/**
 * Enable html or json response. If output is not
 * enabled, empty response will be returned when
 * controller calls respond methods.
 */
JetBaseObject.prototype.enableOutput = function() {
    this.__disableOutput = false;
};

/**
 * Redirects to given url!
 * @param url
 * @param statusCode
 * @param additionalHeaders
 */
JetBaseObject.prototype.redirect = function(url, statusCode, additionalHeaders) {
    var code = 302;
    var headers = {Location: url};

    /// Set status code...
    if (statusCode) {
        if ('object' === typeof statusCode) {
            additionalHeaders = statusCode;
        } else {
            code = isNaN(parseInt(statusCode)) ? code : parseInt(statusCode);
        }
    }

    /// Add custom headers...
    if ('object' === typeof additionalHeaders) {
        for(var i in additionalHeaders) {
            headers[i] = additionalHeaders[i];
        }
    }

    /// Send redirect to browser...
    this.res.writeHead(code, headers);
    this.res.end();
};

/**
 * This method is used when http request should not have
 * any output but we want to close connection, so we just
 * send empty string to our client.
 *
 * Another situation when this method is used is when our
 * socket event we've processed does not have a response,
 * but we updated session, so this function needs to be
 * called so session changes would get saved.
 */
JetBaseObject.prototype.finish = function() {
    /// It does not matter if the request was socket
    /// or regular http. Both response objects have
    /// the same interfaces to enable interoperability
    /// of the implemented functions.
    if (!this.__responseSent) {
        this.__responseSent = true;
        this.res.finish();
    }
};

/**
 * Send json response to the client.
 * @param data
 */
JetBaseObject.prototype.json = function(data) {
    if (!this.__responseSent) {
        this.__responseSent = true;
        this.res.json(data);
    }
};

/**
 * Send json response to the client, without rendering template.
 * @param data
 */
JetBaseObject.prototype.end = function(data) {
    if (!this.__responseSent) {
        this.__responseSent = true;
        this.res.end(data);
    }
};

/**
 * Send only inner html.
 * @param customData
 */
JetBaseObject.prototype.sendInnerHtml = function(customData) {
    if (!this.__disableOutput && !this.__responseSent) {
        var self = this;
        var tpl = this.getTemplateGenerator(this.getInnerTemplatePath(), null);

        /// If there is custom data, add to page values...
        if ('object' === typeof customData) {
            this.innerValues = this.Jet.utils.extend(this.innerValues, customData);
        }

        tpl.renderInnerHtml(self.innerValues, function(err, html) {
            if (err) {
                self.Jet.log(err);
                self.res.send(('dev' === self.Jet.app.get('env') ? err : ''));
            } else {
                /// Send html...
                self.sendDataToClient(html);
                /// Call callback...
                if ('function' === typeof cb) {
                    cb(html);
                }
            }
        });
    } else {
        this.finish();
    }
};

/**
 * Send only outer html.
 * @param customData
 */
JetBaseObject.prototype.sendOuterHtml = function(customData) {
    if (!this.__disableOutput && !this.__responseSent) {
        var self = this;
        var tpl = this.getTemplateGenerator(null, this.getOuterTemplatePath());

        /// If there is custom data, add to page values...
        if ('object' === typeof customData) {
            this.outerValues = this.Jet.extend(this.outerValues, customData);
        }

        tpl.renderOuterHtml("", this.outerValues, function(err, html) {
            if (err) {
                self.Jet.log(err);
                self.res.send(('dev' === self.Jet.app.get('env') ? err : ''));
            } else {
                /// Send html...
                self.sendDataToClient(html);
                /// Call callback...
                if ('function' === typeof cb) {
                    cb(html);
                }
            }
        });
    } else {
        this.finish();
    }
};

/**
 * Send response back to the client. This function will decide
 * what kind of response the client will receive. This part of
 * the logic is implemented here because it depends on request
 * object, and since response object is not aware of request
 * object but the controller object is, controller object gets
 * to decide about the response.
 *
 * @param customData
 */
JetBaseObject.prototype.send = function(customData) {
    if (!this.__disableOutput && !this.__responseSent) {
        var self = this;
        var tpl = this.getTemplateGenerator(this.getInnerTemplatePath(), this.getOuterTemplatePath());

        /// If there is custom data, add to page values...
        if ('object' === typeof customData) {
            this.innerValues = this.Jet.utils.extend(this.innerValues, customData);
        }

        tpl.renderFullHtml(this.innerValues, this.outerValues, function(err, html) {
            if (err) {
                self.Jet.log(err);
            } else {
                /// Send html...
                self.sendDataToClient(html);
                /// Call callback...
                if ('function' === typeof cb) {
                    cb(html);
                }
            }
        });
    } else {
        this.finish();
    }
};

/**
 * Send response to the client. Response sent is data argument,
 * and mime is the type of the response...
 *
 * @param data
 * @param mime
 */
JetBaseObject.prototype.sendDataToClient = function(data, mime) {
    if (this.res.isSocket) {
        this.res.send(data);
    } else {
        var bufferData = new Buffer(data);
        this.res.set('Content-Length', bufferData.byteLength);

        if ('object' === typeof data) {
            /*try {
                data = JSON.stringify(data);
            } catch (e) {
                data = JSON.stringify(e);
            }*/
            /// This is the case for json objects...
            this.res.set('Content-Type', 'application/json; charset=utf-8');
        } else {
            mime = mime || 'text/html';
            this.res.set('Content-Type', mime);
        }

        this.res.send(data);
    }
};

/**
 * Returns an instance of template generator.
 * @param innerTemplate
 * @param outerTemplate
 * @returns {*}
 */
JetBaseObject.prototype.getTemplateGenerator = function(innerTemplate, outerTemplate) {
    var TemplateGenerator = require(this.Jet.dir.jet + '/lib/templates/GenerateTemplate.js');
    return new TemplateGenerator(this.Jet, innerTemplate, outerTemplate);
};