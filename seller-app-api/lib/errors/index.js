import UnauthenticatedError from './unauthenticated.error';
import UnauthorisedError from './unauthorised.error';
import NoRecordFoundError from './no-record-found.error';
import DuplicateRecordFoundError from './duplicate-record-found.error';
import BadRequestParameterError from './bad-request-parameter.error';
import ConflictError from './conflict.error';
import PreconditionRequiredError from './precondition-required.error';

exports.UnauthenticatedError = UnauthenticatedError;
exports.UnauthorisedError = UnauthorisedError;
exports.NoRecordFoundError = NoRecordFoundError;
exports.DuplicateRecordFoundError = DuplicateRecordFoundError;
exports.BadRequestParameterError = BadRequestParameterError;
exports.ConflictError = ConflictError;
exports.PreconditionRequiredError = PreconditionRequiredError;