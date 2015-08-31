module.exports = {
    'cookieSecret'              : '/replace_this_value_with_more_secure_one/',
    'sessionSecret'             : '/replace_this_value_with_more_secure_one/',
    'sessionName'               : 'jetsid',
    'sessionSecure'             : false,
    'serveStatic'               : false,
    'useSession'                : false,
    'useRedis'                  : false,
    'useRedisSession'           : false,
    'redisOptions'              : {
        'port'      : 6379,
        'host'      : '127.0.0.1',
        'options'   : {}
    },
    'useWebSockets'             : false,
    'useMorganLogging'          : false,
    'useConsoleLogging'         : true,
    'staticDirectory'           : '/static',
    'servicesDirectory'         : '/services',
    'classesDirectory'          : '/classes'
};