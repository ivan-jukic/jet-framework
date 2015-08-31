module.exports = {
    'main'              : {url: '/', ctl: 'TestController'},
    'regular'           : {url: '/normal', ctl: 'TestController', method: 'testNormal'},
    'altTpl'            : {url: '/get-alt-template', ctl: 'TestController', method: 'testAltTemplate'},
    'params'            : {url: '/test-params/:param1/:param2', ctl: 'TestController', method: 'testParams'},
    'verbGet'           : {url: '/verb/get-post', ctl: 'TestController', method: 'getVerbTest', verb: 'get'},
    'verbPost'          : {url: '/verb/get-post', ctl: 'TestController', method: 'postVerbTest', verb: 'post'},
    'multiVerb'         : {url: '/verb/multi', ctl: 'TestController', method: 'multiVerbTest', verb: ['put', 'delete']},
    'outerRoute'        : {resource: '/routes.other.js'},
    'socket:test'       : {ctl: 'TestController', method: 'socketTest'},
    'socket:space:test' : {ctl: 'TestController', method: 'socketNameSpaceTest'}
};