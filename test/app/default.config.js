module.exports = {
    'cookieSecret'              : '/replace_this_value_with_more_secure_one/',
    'sessionSecret'             : '/replace_this_value_with_more_secure_one/',
    'sessionName'               : 'jetsid',
    'sessionSecure'             : true,
    'serveStatic'               : true,
    'useSession'                : true,
    'useRedis'                  : false,
    'useRedisSession'           : false,
    'redisOptions'              : {
        'port'      : 6379,
        'host'      : '127.0.0.1',
        'options'   : {}
    },
    'useWebSockets'             : false,
    'useMorganLogging'          : true,
    'useConsoleLogging'         : true,
    'staticDirectory'           : '/static',
    'servicesDirectory'         : '/services',
    'classesDirectory'          : '/classes'
};