exports.SYSTEM_ROLES = {
    SUPER_ADMIN: 'Super Admin',
    VENDOR: 'Vendor',
    CUSTOMER: 'Customer',
};

exports.EMAIL_TEMPLATES = {
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    SIGN_UP: 'SIGN_UP',
    REGISTER: 'REGISTER',
    EXCEPTION: 'EXCEPTION',
    USER_ACTIVITY: 'USER_ACTIVITY',
};

exports.RESOURCE_POSSESSION = {
    OWN: 'OWN',
    ANY: 'ANY',
    SUB: 'SUB'
};

exports.HEADERS = {
    ACCESS_TOKEN: 'access-token',
    AUTH_TOKEN: 'Authorization',
}

exports.DEVICE_TYPE = {
    IOS_TYPE_ID: '00000000-0000-0000-0000-000000005002',
    ANDROID_TYPE_ID: '00000000-0000-0000-0000-000000005001',
}


export const PRODUCT_CATEGORY = {
    "grocery": "Grocery",
    "beauty_and_personal_care": "Beauty & Personal Care",
    "fashion": "Fashion",
    "home_and_decor": "Home and Decor",
    "f_and_b": "F&B",
}

export const PRODUCT_SUBCATEGORY = {
    grocery: [
        {value: 'fruits_and_vegetables', key: 'Fruits and Vegetables', protocolKey: "@ondc/org/mandatory_reqs_veggies_fruits"},
        {value: 'masala_and_seasoning', key: 'Masala & Seasoning', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'oil_and_ghee', key: 'Oil & Ghee', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'gourmet_and_world_foods', key: 'Gourmet & World Foods', protocolKey: "@ondc/org/statutory_reqs_prepackaged_food"},
        {value: 'foodgrains', key: 'Foodgrains', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'eggs_meat_and_fish', key: 'Eggs, Meat & Fish', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'cleaning_and_household', key: 'Cleaning & Household', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'beverages', key: 'Beverages', protocolKey: "@ondc/org/statutory_reqs_prepackaged_food"},
        {value: 'beauty_and_hygiene', key: 'Beauty & Hygiene', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'bakery_cakes_and_dairy', key: 'Bakery, Cakes & Dairy', protocolKey: "@ondc/org/statutory_reqs_prepackaged_food"},
        {value: 'kitchen_accessories', key: 'Kitchen Accessories', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'baby_care', key: 'Baby Care', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'snacks_and_branded_Foods', key: 'Snacks & Branded Foods', protocolKey: "@ondc/org/statutory_reqs_prepackaged_food"},
        {value: 'pet_care', key: 'Pet Care', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
        {value: 'stationery', key: 'Stationery', protocolKey: "@ondc/org/statutory_reqs_packaged_commodities"},
    ],
    beauty_and_personal_care: [
        {value: "bath_and_body", key: "Bath & Body", protocolKey: ''},
        {value: "feminine_care", key: "Feminine Care", protocolKey: ''},
        {value: "fragrance", key: "Fragrance", protocolKey: ''},
        {value: "hair_care", key: "Hair Care", protocolKey: ''},
        {value: "make_up", key: "Make Up", protocolKey: ''},
        {value: "mens_grooming", key: "Men's Grooming", protocolKey: ''},
        {value: "oral_care", key: "Oral Care", protocolKey: ''},
        {value: "skin_care", key: "Skin Care", protocolKey: ''},
        {value: "maternity_care", key: "Maternity Care", protocolKey: ''},
        {value: "baby_care", key: "Baby Care", protocolKey: ''},
        {value: "nursing_and_feeding", key: "Nursing & Feeding", protocolKey: ''},
        {value: "sexual_wellness_and_sensuality", key: "Sexual Wellness & Sensuality", protocolKey: ''},
        {value: "tools_and_accessories", key: "Tools & Accessories", protocolKey: ''},
    ],
    fashion: [
        {value: "mens_fashion_accessories", key: "Men's Fashion Accessories", protocolKey: ''},
        {value: "mens_footwear_accessories", key: "Men's Footwear Accessories", protocolKey: ''},
        {value: "mens_topwear", key: "Men's Topwear", protocolKey: ''},
        {value: "mens_bottomwear", key: "Men's Bottomwear", protocolKey: ''},
        {value: "mens_innerwear_and_sleepwear", key: "Men's Innerwear & Sleepwear", protocolKey: ''},
        {value: "mens_bags_and_luggage", key: "Men's Bags & Luggage", protocolKey: ''},
        {value: "mens_eyewear", key: "Men's Eyewear", protocolKey: ''},
        {value: "mens_footwear", key: "Men's Footwear", protocolKey: ''},
        {value: "mens_jewellery", key: "Men's Jewellery", protocolKey: ''},
        {value: "womens_fashion_accessories", key: "Women's Fashion Accessories", protocolKey: ''},
        {value: "womens_footwear_accessories", key: "Women's Footwear Accessories", protocolKey: ''},
        {value: "womens_indian_and_dusion_wear", key: "Women's Indian & Fusion Wear", protocolKey: ''},
        {value: "womens_western_wear", key: "Women's Western Wear", protocolKey: ''},
        {value: "womens_lingerie_and_sleepwear", key: "Women's Lingerie & Sleepwear", protocolKey: ''},
        {value: "womens_bags_and_luggage", key: "Women's Bags & Luggage", protocolKey: ''},
        {value: "womens_eyewear", key: "Women's Eyewear", protocolKey: ''},
        {value: "womens_footwear", key: "Women's Footwear", protocolKey: ''},
        {value: "womens_jewellery", key: "Women's Jewellery", protocolKey: ''},
        {value: "boys_clothing", key: "Boy's Clothing", protocolKey: ''},
        {value: "boys_footwear", key: "Boy's Footwear", protocolKey: ''},
        {value: "girls_clothing", key: "Girl's Clothing", protocolKey: ''},
        {value: "girls_footwear", key: "Girl's Footwear", protocolKey: ''},
        {value: "infants_wear", key: "Infant's Wear", protocolKey: ''},
        {value: "infant_care_and_accessories", key: "Infant Care & Accessories", protocolKey: ''},
        {value: "infant_feeding_and_nursing_essentials", key: "Infant Feeding & Nursing Essentials", protocolKey: ''},
        {value: "infant_bath_accessories", key: "Infant Bath Accessories", protocolKey: ''},
        {value: "infant_health_and_safety", key: "Infant Health & Safety", protocolKey: ''},
        {value: "infant_diapers_and_toilet_training", key: "Infant Diapers & Toilet Training", protocolKey: ''},
        {value: "kids_towels_and_wrappers", key: "Kid's Towels & Wrappers", protocolKey: ''},
        {value: "kids_fashion_accessories", key: "Kid's Fashion Accessories", protocolKey: ''},
        {value: "kids_jewellery", key: "Kid's Jewellery", protocolKey: ''},
        {value: "kids_eyewear", key: "Kid's Eyewear", protocolKey: ''},
        {value: "kids _bags_and_luggage", key: "Kid's Bags & Luggage", protocolKey: ''},
    ],
    home_and_decor: [
        {value: 'home_decor', key: 'Home Decor', protocolKey: ''},
        {value: 'home_furnishings', key: 'Home Furnishings', protocolKey: ''},
        {value: 'furniture', key: 'Furniture', protocolKey: ''},
        {value: 'garden_and_outdoor_products', key: 'Garden and Outdoor Products', protocolKey: ''},
        {value: 'home_improvement', key: 'Home Improvement', protocolKey: ''},
        {value: 'cookware_and_dining', key: 'Cookware and Dining', protocolKey: ''},
        {value: 'storage_and_organisation', key: 'Storage and Organisation', protocolKey: ''},
    ],
    f_and_b: [
        {value: 'continental', key: 'Continental', protocolKey: ''},
        {value: 'middle_eastern', key: 'Middle Eastern', protocolKey: ''},
        {value: 'north_indian', key: 'North Indian', protocolKey: ''},
        {value: 'pan_asian', key: 'Pan-Asian', protocolKey: ''},
        {value: 'regional_indian', key: 'Regional Indian', protocolKey: ''},
        {value: 'south_indian', key: 'South Indian', protocolKey: ''},
        {value: 'tex_mexican', key: 'Tex-Mexican', protocolKey: ''},
        {value: 'world_cuisines', key: 'World Cuisines', protocolKey: ''},
        {value: 'healthy_food', key: 'Healthy Food', protocolKey: ''},
        {value: 'fast_food', key: 'Fast Food', protocolKey: ''},
        {value: 'desserts', key: 'Desserts', protocolKey: ''},
        {value: 'bakes_and_cakes', key: 'Bakes & Cakes', protocolKey: ''},
        {value: 'beverages', key: 'Beverages (MTO)', protocolKey: ''},
    ]
};

export const FIELD_NOT_ALLOWED_BASED_ON_PROTOCOL_KEY = {
    "@ondc/org/mandatory_reqs_veggies_fruits": ["manufacturerOrPackerName", "manufacturerOrPackerAddress", "commonOrGenericNameOfCommodity", "monthYearOfManufacturePackingImport", "nutritionalInfo", "additiveInfo", 'importerFSSAILicenseNo', "brandOwnerFSSAILicenseNo"],
    "@ondc/org/statutory_reqs_packaged_commodities": ["nutritionalInfo", "additiveInfo", "importerFSSAILicenseNo", "brandOwnerFSSAILicenseNo"],
    "@ondc/org/statutory_reqs_prepackaged_food": ["manufacturerOrPackerName", "manufacturerOrPackerAddress", "commonOrGenericNameOfCommodity", "packQty", "monthYearOfManufacturePackingImport"],
}

export const FIELD_ALLOWED_BASED_ON_PROTOCOL_KEY = {
    "Fruits and Vegetables":"@ondc/org/mandatory_reqs_veggies_fruits",
    "Masala & Seasoning":"@ondc/org/statutory_reqs_packaged_commodities",
    "Gourmet & World Foods":"@ondc/org/statutory_reqs_prepackaged_food",
    "Bakery, Cakes & Dairy":"@ondc/org/statutory_reqs_prepackaged_food",
    "Snacks & Branded Foods":"@ondc/org/statutory_reqs_prepackaged_food",
    "Beverages":"@ondc/org/statutory_reqs_prepackaged_food",
    "Foodgrains":"@ondc/org/statutory_reqs_packaged_commodities",
    "Eggs, Meat & Fish":"@ondc/org/statutory_reqs_packaged_commodities",
    "Cleaning & Household":"@ondc/org/statutory_reqs_packaged_commodities",
    "Beauty & Hygiene":"@ondc/org/statutory_reqs_packaged_commodities",
    "Kitchen Accessories":"@ondc/org/statutory_reqs_packaged_commodities",
    "Baby Care":"@ondc/org/statutory_reqs_packaged_commodities",
    "Pet Care":"@ondc/org/statutory_reqs_packaged_commodities",
    "Stationery":"@ondc/org/statutory_reqs_packaged_commodities"
}

export const domainNameSpace=
    [
        {
            "name":"Grocery",
            "domain":"ONDC:RET10"
        },
        {
            "name":"F&B",
            "domain":"ONDC:RET11"
        },
        {
            "name":"Fashion",
            "domain":"ONDC:RET12"
        },
        {
            "name":"Beauty & Personal Care",
            "domain":"ONDC:RET13"
        },
        {
            "name":"Electronics",
            "domain":"ONDC:RET14"
        },
        {
            "name":"Appliances",
            "domain":"ONDC:RET15"
        },
        {
            "name":"Home & Decor",
            "domain":"ONDC:RET16"
        },
        {
            "name":"Toys & Games",
            "domain":"ONDC:RET17"
        },
        {
            "name":"Agriculture",
            "domain":"ONDC:RET18"
        },
        {
            "name":"Health & Wellness",
            "domain":"ONDC:RET19"
        }
    ]









