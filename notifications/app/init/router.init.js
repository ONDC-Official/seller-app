import { Router } from 'express';
import glob from 'glob';
import cors from 'cors';
import { mergedEnvironmentConfig as config } from '../config/env.config';

const whitelist = config.cors.whitelistUrls;
const corsOptionsDelegate = function (req, callback) {
    let corsOptions = {credentials: true};
    corsOptions['origin'] = (whitelist.indexOf(req.header('Origin')) !== -1);
    corsOptions['exposedHeaders'] = 'set-cookie';
    callback(null, corsOptions); // callback expects two parameters: error and optionsns
};

module.exports = () => glob
    .sync('**/*.route.js', {
        cwd: `${global.__basedir}/modules/`,
    })
    .map((filename) => {
        // console.log(`Attempting to register router at: path ../modules/${filename} from relative path ${__dirname}`);
        return require(`../modules/${filename}`);
    })
    .filter((currentRouter) => {
        const isCurrentRouterValid = Object.getPrototypeOf(currentRouter) === Router;
        return isCurrentRouterValid;
    })
    .reduce(
        (rootRouter, router) => rootRouter.use(router, cors(corsOptionsDelegate)),
        Router({
            mergeParams: true,
        })
    );
