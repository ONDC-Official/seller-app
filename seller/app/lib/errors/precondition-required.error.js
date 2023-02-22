import ERRORS from './errors';

class PreconditionRequiredError extends Error {
    constructor(message = ERRORS.PRECONDITION_REQUIRED_ERROR.message) {
        super(message);
        this.name = ERRORS.PRECONDITION_REQUIRED_ERROR.name;
        this.status = ERRORS.PRECONDITION_REQUIRED_ERROR.status;
    }
}

export default PreconditionRequiredError;
