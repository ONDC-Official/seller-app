import { BadRequestParameterError } from '../../../../lib/errors';

exports.middleware = (options) => async (req, res, next) => {
    try {
        let data;

        let { schema } = options;

        // Read data from request body
        if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            data = req.body;
        } else {
            // Read data from request query params
            data = req.params;
        }

        const { error } = schema.validate(data);
        if (error) {
            next(new BadRequestParameterError(error));
        } else {
            next();
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};
