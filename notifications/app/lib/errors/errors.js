const ERRORS = {
    BAD_REQUEST_PARAMETER_ERROR: {
        status: 400,
        name: 'BAD_REQUEST_PARAMETER_ERROR',
        message: 'Bad request parameter',
    },
    UNAUTHENTICATED_ERROR: {
        status: 401,
        name: 'UNAUTHENTICATED_ERROR',
        message: 'Unauthenticated',
    },
    UNAUTHORISED_ERROR: {
        status: 403,
        name: 'UNAUTHORISED_ERROR',
        message: 'Permission denied',
    },
    NO_RECORD_FOUND_ERROR: {
        status: 404,
        name: 'NO_RECORD_FOUND_ERROR',
        message: 'Record not found',
    },

    CONFLICT_ERROR: {
        status: 409,
        name: 'CONFLICT_ERROR',
        message: 'Conflict error',
    },
    PRECONDITION_REQUIRED_ERROR: {
        status: 412,
        name: 'PRECONDITION_REQUIRED_ERROR',
        message: 'Precondition required',
    },
    DUPLICATE_RECORD_FOUND_ERROR: {
        status: 409,
        name: 'DUPLICATE_RECORD_FOUND_ERROR',
        message: 'Duplicate record found',
    },
    WARNING_ERROR: {
        status: 418,
        name: 'WARNING',
        message: 'Warning',
    },
};

export default ERRORS;
