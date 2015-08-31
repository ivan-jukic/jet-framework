exports = module.exports = function poweredBy() {
    var Jet = this;
    return function poweredBy(req, res, next) {
        res.setHeader('X-Powered-By', 'Jet/' + Jet.package.fwk.version);
        next();
    };
};