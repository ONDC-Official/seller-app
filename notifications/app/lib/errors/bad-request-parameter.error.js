import ERRORS from './errors';

class BadRequestParameterError extends Error {
    constructor(message = ERRORS.BAD_REQUEST_PARAMETER_ERROR.message) {
        super(message);
        this.name = ERRORS.BAD_REQUEST_PARAMETER_ERROR.name;
        this.status = ERRORS.BAD_REQUEST_PARAMETER_ERROR.status;
    }
}

export default BadRequestParameterError;
