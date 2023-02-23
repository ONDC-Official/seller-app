import { EMAIL_TEMPLATES } from '../../../lib/utils/constants';
import ForgotPassword from './forgot-password';
import SignUp from './sign-up';

export default {
    [EMAIL_TEMPLATES.FORGOT_PASSWORD]: ForgotPassword,
    [EMAIL_TEMPLATES.SIGN_UP]: SignUp,
};
