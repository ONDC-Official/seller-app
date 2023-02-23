import ERRORS from './errors';

class DuplicateRecordFoundError extends Error {
    constructor(message = ERRORS.DUPLICATE_RECORD_FOUND_ERROR.message) {
        super(message);
        this.name = ERRORS.DUPLICATE_RECORD_FOUND_ERROR.name;
        this.status = ERRORS.DUPLICATE_RECORD_FOUND_ERROR.status;
    }
}

export default DuplicateRecordFoundError;
