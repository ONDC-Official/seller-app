// Global variable and config setup
global.__basedir = __dirname;
/**
 * Import libraries, utils and packages
 */
import http from'http';
import express from'express';
import { getRoutes } from'get-routes';
import { mergedEnvironmentConfig } from'./config/env.config';
const { sendNotificationEmail } = require('./modules/email/email.service');
import cors from 'cors';
import './init/database.init';
import logger from 'morgan';
/**
 * Express JS setup
 */
const app = express();

// Get port from environment and store in Express.
let port = mergedEnvironmentConfig.servicePort || '3000';
try {
    port = parseInt(port, 10);
    if (Number.isNaN(port)) {
        // named pipe
        port = mergedEnvironmentConfig.servicePort;
    }

    if (port >= 0) {
        // port number
        port = mergedEnvironmentConfig.servicePort;
    }
} catch (error) {
    port = mergedEnvironmentConfig.servicePort;
}

// Create HTTP server.
const server = http.createServer(app);

server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
    default:
        throw error;
    }
});

server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
});

app.use((req, res, next) => {
    const host = req.get('host');
    const origin = req.get('origin');
    const baseUrlInRequest = `${req.protocol}://${req.get('host')}`;
    // console.log(`[NES][REQUEST_INTERCEPTOR] baseUrlInRequest ${baseUrlInRequest} host ${host} origin ${origin}`);
    return next();
});

// Global exception handler for HTTP/HTTPS requests
app.use(function (err, req, res, next) {
    // Send response status based on custom error code
    if (err.status) {
        return res.status(err.status).json({error: err.message});
    }
});
app.use(express.json({ limit: '50mb' }));
app.use(express.raw());
app.use(express.text());
app.use(
    express.urlencoded({
        limit: '50mb',
        extended: false,
    })
);
app.disable('etag');
app.use(logger('dev'));
/**
 * Router initialization
 */
const routes = require('./init/router.init')();
// app.use('/api/', cors(corsOptionsDelegate) ,routes);
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(jsonParser); // use it globally


const whitelist = mergedEnvironmentConfig.cors.whitelistUrls;
const corsOptionsDelegate = function (req, callback) {
    let corsOptions = {credentials: true};
    corsOptions['origin'] = (whitelist.indexOf(req.header('Origin')) !== -1);
    corsOptions['exposedHeaders'] = 'set-cookie';
    callback(null, corsOptions); // callback expects two parameters: error and optionsns
};

(async () => {
    try {
        // Wait for the DB connection to setup and initialize the DB models

        // Resgister routes once the DB models are registered
        app.use('/api', cors(corsOptionsDelegate) ,routes);
        const routeDetails = getRoutes(app);
        console.log('Registered API paths are: \n', routeDetails);
        console.log('Registered API paths are: \n', mergedEnvironmentConfig);
        // Global exception handler for HTTP/HTTPS requests
        app.use(function (err, req, res, next) {

            console.log('err.status==============>',err.status);
            // Send response status based on custom error code
            if (err.status) {
                return res.status(err.status).json({error: err.message});
            }

            if(!err.status){
                const { baseUrl, path, body, query, headers } = req;
                const fullUrl = `${baseUrl}${path}`;
                const debugInfo = {
                    fullUrl, body, query, headers
                };

                const emailBody =`
		Team,\n\n
		Here are the details of the exception:\n\n
		Request fullUrl: ${debugInfo.fullUrl}\n\n
		Request body : ${JSON.stringify(debugInfo.body)}\n\n
		Request query: ${JSON.stringify(debugInfo.query)}\n\n
		Request headers: ${JSON.stringify(debugInfo.headers)}\n\n
		Error message: ${err?.message}\n\n
		Error stacktrace: ${err?.stack}\n`;

                const emailSubject = err?.message ?? `Exception occurred at ${new Date()}`;

                const bindingParams = {
                    emailRecipients: mergedEnvironmentConfig.email.exceptionEmailRecipients,
                    subject: `EXCEPTION: ONDC: Env ${mergedEnvironmentConfig.appEnvironment} : ${emailSubject}`,
                    text: emailBody
                };

                // Send an exception email to dev users
                sendNotificationEmail({templateName: 'EXCEPTION_EMAIL', bindingParams});

            }
            res.status(500).json({ error: 'Something went wrong. Please try again' });
        });
        // Listen on provided port, on all network interfaces.
        app.set('port', port);
        server.listen(port);
    } catch (expressStartupError) {
        // logger.info('[server.js] Express startup failed. expressStartupError: ', {tagMetaData: {expressStartupError}});
    }
})();

module.exports = app;
