
exports.EMAIL_TEMPLATES = {
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    SIGN_UP: 'SIGN_UP',

};

exports.DEVICE_TYPE = {
    IOS_TYPE_ID: '00000000-0000-0000-0000-000000005002',
    ANDROID_TYPE_ID: '00000000-0000-0000-0000-000000005001',
};

exports.HEADERS = {
    ACCESS_TOKEN: 'access-token',
    AUTH_TOKEN: 'Authorization',
};

const ACCESS_TYPES = {
    PRIVATE: 'PRIVATE',
    PUBLIC: 'PUBLIC',
};

exports.ACCESS_TYPES = ACCESS_TYPES;


const GENDERS = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
};

const SYSTEM_ROLE = {
    SUPER_ADMIN: 'Super Admin',
    ORG_ADMN:'Organization Admin'
};
exports.GENDERS = GENDERS;
exports.SYSTEM_ROLE = SYSTEM_ROLE;

exports.RETURN_REASONS = [
    {
        key: '001',
        value: 'Buyer does not want product any more',
        isApplicableForNonReturnable: false,
    },
    {
        key: '002',
        value: 'Product available at lower than order price',
        isApplicableForNonReturnable: false,
    },
    {
        key: '003',
        value: 'Product damaged or not in usable state',
        isApplicableForNonReturnable: true,
    },
    {
        key: '004',
        value: 'Product is of incorrect quantity or size',
        isApplicableForNonReturnable: true,
    },
    {
        key: '005',
        value: 'Product delivered is different from what was shown and ordered',
        isApplicableForNonReturnable: true,
    }
];


exports.commonKeys = [
    'productCode', 'productName',
    'MRP', 'retailPrice',
    'purchasePrice', 'HSNCode',
    'GST_Percentage', 'productCategory',
    'quantity', 'barcode',
    'maxAllowedQty', 'UOM',
    'packQty','returnWindow',
    'manufacturerName', 'manufacturedDate',
    'instructions', 'isCancellable',
    'longDescription', 'availableOnCod',
    'description', 'images'
];

exports.templateKeys = {
    grocery: [
        'isVegeterian'
    ],
    fnb: [
        'nutritionalInfo', 'additiveInfo', 'isVegeterian'
    ],
    fashion: [
        'length','breadth',
        'height','weight'
    ],
    bpc: [
        'nutritionalInfo'
    ],
    homeandkitchen: [
        'isReturnable'
    ],
    healthandwellness: [
        'isReturnable'
    ],
    electronics: [
        'length', 'breadth',
        'height', 'weight',
        'isReturnable'
    ]
};
