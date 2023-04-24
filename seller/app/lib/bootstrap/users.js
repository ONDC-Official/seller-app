const env = process.env.NODE_ENV || 'development'; // By default development environment is picked

// default users fordevelopment and staging/production environment
const users = (env === 'development') ? [
    {
        'name': 'Abhinandan',
        'username': 'sa@mailinator.com',
        'email': 'sa@mailinator.com',
        'roleName': 'Super Admin',
        'template': 'Super Admin',
        'gender': 'Male',
        'nationality': 'Indian',
        'dateOfBirth': '1990-01-08',
        'mobile': '+918796105046'
        
    }
] : [
    {
        'name': 'Abhinandan',
        'username': 'sa@mailinator.com',
        'email': 'sa@mailinator.com',
        'roleName': 'Super Admin',
        'template': 'Super Admin',
        'gender': 'Male',
        'nationality': 'Indian',
        'dateOfBirth': '1990-01-08',
        'mobile': '+918796105046'
      
    }
];

export default users;
