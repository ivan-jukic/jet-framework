module.exports = Cache = {};

/**
 * Establishes a connection to the redis for caching.
 * TODO: handle multiple caching system
 * @param next
 */
Cache.initRedisConnection = function(next) {
    if (this.app.get('useRedis')) {
        var redisModule = require('redis');
        var redisConfig = this.app.get('redisOptions');

        /// Open redis connection...
        this.redis = redisModule.createClient(redisConfig.port, redisConfig.host, redisConfig.options);
        this.redis
            .on('error', function(err) {
                console.log('error connecting to redis (cache)');
                throw new Error(err);
            })
            .on('connect', function() {
                next();
            });
    } else {
        next();
    }
};