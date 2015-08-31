/**
 * Module which is responsible to set middleware
 * based on our configuration parameters.
 * @type {{}}
 */
module.exports = Middleware = {};


/**
 * Method used to initialize app middleware.
 */
Middleware.initMiddleware = function(next) {
    /// Enable serving of static files. If we are serving static files
    /// through some other means, like proxy server, this should be disabled.
    if (this.app.get('serveStatic')) {
        var serveStatic = require('serve-static');
        this.app.use(serveStatic(this.dir.app + this.app.get('staticDirectory')));
    }

    /// Parses requests with payload, like on post or put requests.
    /// The payload becomes available in the request object.
    var bodyParser = require('body-parser');
    this.app.use(bodyParser.urlencoded({extended: false}));                // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.json());                                       // parse application/json
    this.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));   // parse application/vnd.api+json as json
    this.app.use(require('compression')());
    this.app.use(require('cookie-parser')(this.app.get('cookieSecret')));

    /// Init session middleware...
    var self = this;
    Middleware.initSession.call(this, function() {

        /// Morgan logging displays request url in console.
        if (self.app.get('useMorganLogging') && !(self.arguments && self.arguments.disableOutput)) {
            var morgan = require('morgan');
            self.app.get('env') === 'development' ? self.app.use(morgan('dev')) : self.app.use(morgan('short'));
        }

        /// Initialize custom middleware...
        var middlewareObject;
        var middleware  = [
            'RequestType',
            'PoweredBy',
            'ClientIP'
        ];

        for (var i = 0; i < middleware.length; i++) {
            middlewareObject = require(self.dir.jet + '/lib/middleware/' + middleware[i] + '.js');

            /// Set middleware in the context of this app.
            self.app.use(middlewareObject.call(self));
        }

        next();
    });
};


Middleware.initSession = function(next) {
    /// If we do not use se sessions.
    if (!this.app.get('useSession')) {
        next();
        return;
    }

    var self = this;
    var expressSession = require('express-session');
    var sessionSettings = {
        secret: this.app.get('sessionSecret'),
        name: this.app.get('sessionName'),
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: this.app.get('sessionSecure')   /// requires HTTPS enabled website
        }
    };

    /// Using redis to store sessions is forced in production environment.
    if (this.app.get('useRedisSession') || 'prod' === this.app.get('env')) {
        /// Use redis store object...
        var redisStore = require('connect-redis')(expressSession);

        /// Session data will be stored in redis.
        this.sessionStore = sessionSettings.store = new redisStore(this.app.get('redisOptions'));

        /// If an error occurs while trying to connect to redis server.
        sessionSettings.store.client.stream.on('error', function(err) {
            self.log('error connecting to redis (session)');
            throw new Error(err);
        });
        sessionSettings.store.client.stream.on('connect', function() {
            next();
        });

        /// Register session...
        this.app.use(expressSession(sessionSettings));
    } else {
        /// Memory store, not usable in production environment, not scalable and will probably cause memory leaks...
        var MemoryStore = require(this.dir.jet + "/node_modules/express-session/session/memory");

        /// Set memory store as local session storage mechanism...
        this.sessionStore = sessionSettings.store = new MemoryStore();

        /// Register session
        this.app.use(expressSession(sessionSettings));
        next();
    }
};