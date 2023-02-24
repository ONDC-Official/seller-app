import {Authorisation} from '../../lib/authorisation';

exports.middleware = (options) => (req, res, next) => {
    // console.log(`[AAA][Authorization Middleware] User: `, JSON.stringify(req.user, null, 2))
    const httpRequestMethod = req.method.toUpperCase();
    const authorisation = new Authorisation(req.user, options.roles);

    // If user is allowed to access given resource then moved to next function else forbid
    authorisation.isAllowed().then(permission => {
        req.permission = permission;
        next();
    }).catch(() => {
        res.status(403).send();
    });
};

