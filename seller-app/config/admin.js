module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '7891a4c1c7ff20d4f2dd43c5174a1e61'),
  },
});
