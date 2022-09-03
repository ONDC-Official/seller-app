import ERRORS from './errors';

class UnauthenticatedError extends Error {
    constructor(message = ERRORS.UNAUTHENTICATED_ERROR.message, params) {
        super(message);
        this.name = ERRORS.UNAUTHENTICATED_ERROR.name;
        this.status = ERRORS.UNAUTHENTICATED_ERROR.status;
    }
}

export default UnauthenticatedError;