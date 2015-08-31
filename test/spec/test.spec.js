/* Test should be run from the root directory! */
/// Functional testing
/// TODO add socket, ajax, and session tests

describe('App test request', function() {
    var textBody;
    beforeEach(function(done) {
        makeRequest('/', function(err, res, body) {
            textBody = body;
            done();
        })
    });
    it("should be OK", function() {
        expect(textBody).toBe('OK');
    });
});

describe('App test normal request with templates', function() {
    var textBody;
    beforeEach(function(done) {
        makeRequest('/normal', function(err, res, body) {
            textBody = body;
            done();
        })
    });
    it("should be OK", function() {
        expect(textBody).toBe("OUTER_OK;INNER_OK");
    });
});

describe('Alternative template request', function() {
    var textBody;
    beforeEach(function(done) {
        makeRequest('/get-alt-template', function(err, res, body) {
            textBody = body;
            done();
        })
    });
    it("should be ALT_OK", function() {
        expect(textBody).toBe('OUTER_OK;ALT_OK');
    });
});

describe('App parameter test', function() {
    var result;
    beforeEach(function(done) {
        makeRequest('/test-params/something/sweet', function(err, res, body) {
            result = JSON.parse(body);
            done();
        })
    });
    it ('should return parameters', function() {
        expect(result).toEqual({paramOne: 'something', paramTwo: 'sweet'});
    });
});

describe('App get request', function() {
    var result;
    beforeEach(function(done) {
        makeRequest('/verb/get-post', function(err, res, body) {
            result = JSON.parse(body);
            done();
        })
    });

    it ('should run specific method', function() {
        expect(result).toEqual({verb: 'get'});
    });
});

describe('App post request', function() {
    var result;
    beforeEach(function(done) {
        makeRequest({uri: '/verb/get-post', method: 'post'}, function(err, res, body) {
            result = JSON.parse(body);
            done();
        });
    });
    it ('should run specific method', function() {
        expect(result).toEqual({verb: 'post'});
    });
});

describe('App multi verb request PUT', function() {
    var result;
    beforeEach(function(done) {
        makeRequest({uri: '/verb/multi', method: 'put'}, function(err, res, body) {
            result = body;
            done();
        });
    });
    it ('should return verb name', function() {
        expect(result).toEqual('put');
    });
});

describe('App multi verb request DELETE', function() {
    var result;
    beforeEach(function(done) {
        makeRequest({uri: '/verb/multi', method: 'delete'}, function(err, res, body) {
            result = body;
            done();
        });
    });
    it ('should return verb name', function() {
        expect(result).toEqual('delete');
    });
});

describe('App other routes', function() {
    var result;
    beforeEach(function(done) {
        makeRequest('/other-route', function(err, res, body) {
            result = body;
            done();
        });
    });
    it ('should return OTHER', function() {
        expect(result).toEqual("OTHER");
    });
});

/**
 * Method for making requests. Initializes instance of the app,
 * makes the request and returns the result, and then it closes
 * down the instance. Each request, starts new instance.
 * @param url
 * @param data
 * @param cb
 */
function makeRequest(url, data, cb) {
    var Jet = require('./../../core/JetServer.js');
    var request = require('request');
    var testDomain = 'http://localhost:3001';
    var settings = url;

    /// Handle arguments
    if ('function' === typeof data) {
        cb = data; data = undefined;
    }

    if ('string' === typeof settings) {
        settings = testDomain + settings;
    } else if ('object' === typeof settings) {
        settings.uri = testDomain + settings.uri;
        if (!settings.method) {
            settings.method = 'GET';
        }
    }

    var JetApp = new Jet({jetDir: process.cwd(), appDir: process.cwd() + '/test/app', port: 3001});
    JetApp.addEventListener('onServerStart', function() {
        request(settings, function(err, res, body) {
            JetApp.shutdown(function() {
                cb(err, res, body);
            });
        });
    });
    return JetApp.run();
}