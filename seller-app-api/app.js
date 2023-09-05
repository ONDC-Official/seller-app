import 'regenerator-runtime/runtime.js';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import ondcRoutesv1 from './routes/v1/ondc.routes';
import ondcRoutesv2 from './routes/v2/ondc.routes';
import config from './lib/config';
import Mailer from './lib/mailer';
//import initializeFirebase from './lib/firebase/initializeFirebase.js';
//initializeFirebase();
const mailer = new Mailer();

const app = express();

/**
 * Enable Cross Origin Resource Sharing to whitelist origins
 */
const whitelist = config.get('cors').whitelistUrls;
const corsOptionsDelegate = function (req, callback) {
    let corsOptions = {credentials: true};
    // console.log('req url ', req.originalUrl)
    // console.log("req.header ",JSON.stringify(req.headers), whitelist);
    corsOptions['origin'] = (whitelist.indexOf(req.header('Origin')) !== -1);
    corsOptions['exposedHeaders'] = 'set-cookie';
    // console.log('corsOptions ',corsOptions)
    callback(null, corsOptions) // callback expects two parameters: error and optionsns
};

app.use(logger('dev'));

/**
 * Log http request details
 */
//  app.use(logger("HTTP REQUEST LOG  [:date[web]] | :method | :url | :status | :remote-addr | :remote-user | :user-agent | HTTP/:http-version | :res[content-length] | :response-time[digits]"));



app.use(express.json());
app.use(express.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Application REST APIs
app.use('/api/v1', cors(corsOptionsDelegate), ondcRoutesv1);
app.use('/api/v2', cors(corsOptionsDelegate), ondcRoutesv2);
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.disable('etag');

// Error handler
app.use(function (err, req, res, next) {
    // Send response status based on custom error code
    if (err.status) {
        return res.status(err.status).json({error: err.message});
    }

    // Send an exception email to dev users
    const exceptionEmailRecipients = config.get('general').exceptionEmailRecipientList;
     //mailer.exceptionEmail({receivers: exceptionEmailRecipients, data: {err}}).send();

    console.log("errr--------------->",err)
    // If no custom error is thrown then return 500(server side error/exception)
    res.status(500).json({error: 'Something went wrong. Please try again'});
});

module.exports = app;
