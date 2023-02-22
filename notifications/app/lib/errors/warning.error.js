import ERRORS from './errors';

class WarningError extends Error {
    constructor(message = ERRORS.WARNING_ERROR.message) {
        super(message);
        this.name = ERRORS.WARNING_ERROR.name;
        this.status = ERRORS.WARNING_ERROR.status;
    }
}

export default WarningError;
