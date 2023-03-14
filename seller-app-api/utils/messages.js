const MESSAGES = {
    USER_NOT_EXISTS: "Couldn't find the user you are looking for.",
    ALREADY_BLOCKED: "You have already blocked this user",
    INVALID_OTP: 'Invalid OTP',
    USER_ALREADY_REPORTED: 'User is already reported',
    USER_ALREADY_EXISTS: 'User with the given username or email or phone already exists',
    USER_PHONE_ALREADY_EXISTS: 'User with the given phone already exists',
    USER_EMAIL_ALREADY_EXISTS: 'User with the given email already exists',
    LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED: 'Sorry, your account is inactivate. Please contact support',
    LOGIN_ERROR_USER_EMAIL_NOT_FOUND: "Couldn't find user with the given email",
    LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID: 'Sorry, you are not authorised to access this page. Please login again to continue',
    ROLE_NOT_EXISTS: "Couldn't find the role you are looking for.",
    ROLE_DELETE_SUCCESS: 'Role deleted successfully',
    USER_ATTACHED_TO_ROLE_ALREADY: 'There are users attached to this privilege. Please disassociate the users before deleting this role',
    ROLE_ALREADY_EXISTS: 'Role with the given name already exists',
    FORGOT_PASSWORD_SUCCESS: "We have sent password resent link to you email address",
    RESEND_INVITATION_SUCCESS: 'Invitation sent successfully',
    FORGOT_PASSWORD_FAILURE_ACCOUNT_LOCKED: 'Sorry, your account is inactive. Please contact support',
    SET_PASSWORD_SUCCESS: 'Password changed successfully',
    RESET_PASSWORD_SUCCESS: 'Password reset successfully',
    CHANGE_PASSWORD_SUCCESS: 'Password updated successfully',
};

export default MESSAGES;