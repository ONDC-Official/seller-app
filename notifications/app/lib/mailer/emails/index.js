import { EMAIL_TEMPLATES } from '../../../lib/utils/constants';
import ForgotPassword from './forgot-password';
import SignUp from './sign-up';
import BanUser from './ban-user';
import OrgAdminUser from './org-admin-user';

export default {
    [EMAIL_TEMPLATES.FORGOT_PASSWORD]: ForgotPassword,
    [EMAIL_TEMPLATES.SIGN_UP]: SignUp,
    [EMAIL_TEMPLATES.ACCOUNT_LOCKED]: BanUser,
    [EMAIL_TEMPLATES.ACCOUNT_LOCKED_ORG_ADMIN]: OrgAdminUser,
};
