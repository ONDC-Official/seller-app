const unitWeight = ['LB', 'KG', 'GR', 'Hundredths Pounds', 'MG', 'Tons', 'OZ'];
const unitWattage = ['Watt', 'Hours', 'Picowatts', 'Milliamp Hours', 'Milliwatts', 'Microwatts', 'Kilowatt Hours', 'Kilowatts', 'Nanowatts', 'Watts'];
const unitMemory = ['MB', 'GB', 'TB'];
const unitLength = ['FT', 'CM', 'MM', 'DM', 'Picometre', 'µM', 'M', 'Miles', 'Yards', 'Mils', 'IN', 'Nanometre', 'Hundredths-Inches', 'Kilometres', 'Angstrom'];
const unitCapacity = ['liters', 'Quarts', 'Fluid Ounces', 'ounces', 'milliliters', 'Cubic Feet', 'Microliters', 'Cubic Centimeters', 'Pints', 'Gallons', 'pounds', 'Tons', 'Cubic Inches', 'kilograms'];
const unitOptical = ['diopters'];
const unitLensPower = ['milliwatts', 'microwatts', 'horsepower', 'nanowatts', 'picowatts', 'watts'];
const unitGraduation = ['Feet', 'centimeters', 'millimeters', 'Decimeters', 'Pints', 'Inches', 'gallons', 'Cubic Meters', 'nanometer', 'Hundredths-Inches', 'Ten Thousandths Inches', 'Cubic Centimeters', 'Quarts', 'picometer', 'milliliters', 'Kilometers', 'Fluid Ounces', 'Cubic Yards', 'Meters', 'micrometer', 'Cubic Inches', 'Imperial Gallons', 'Yards', 'Cubic Feet', 'Miles', 'Thousandths Inches', 'liters', 'Angstrom'];

const Categories = ['Electronics', 'Grocery', 'Home Decor', 'Health and Wellness', 'Beauty & Personal Care', 'Food and Beverages'];

const SubCategories = [
    {
        'category': 'Electronics',
        'subCategories': [
            'Audio',
            'Camera and Camcorder',
            'Computer Peripheral',
            'Desktop and Laptop',
            'Earphone',
            'Gaming',
            'Headphone',
            'Mobile Phone',
            'Mobile Accessories',
            'Safety Security',
            'Smart Watches',
            'Speaker',
            'Television',
            'Video',
            'Air Conditioning and Air Cleaners',
            'Health, Home and Personal Care',
            'Heaters',
            'Kitchen Appliances',
            'Lighting & Electric Fans',
            'Refrigerators and Freezers',
            'Vacuum Cleaners',
            'Washing Machines and Accessories',
            'Water Purifiers and Coolers'
        ]
    },
    {
        'category': 'Grocery',
        'subCategories': [
            'Fruits and Vegetables',
            'Masala & Seasoning',
            'Oil & Ghee',
            'Gourmet & World Foods',
            'Foodgrains',
            'Eggs, Meat & Fish',
            'Cleaning & Household',
            'Beverages',
            'Beauty & Hygiene',
            'Bakery, Cakes & Dairy',
            'Kitchen Accessories',
            'Baby Care',
            'Snacks & Branded Foods',
            'Pet Care',
            'Stationery',
        ]
    },
    {
        'category': 'Home Decor',
        'subCategories': [
            'Home Decor',
            'Home Furnishings',
            'Furniture',
            'Garden and Outdoor Products',
            'Home Improvement',
            'Cookware and Dining',
            'Storage and Organisation'
        ]
    },
    {
        'category': 'Health and Wellness',
        'subCategories': [
            'Pain Relieving Ointments',
            'Nutrition and Supplements',
            'Personal and Baby Care',
            'Sexual Wellness',
            'Gastric and Other Concerns',
            'Covid Essentials',
            'Diabetes Control',
            'Health Devices',
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategories': [
            'Bath & Body',
            'Feminine Care',
            'Fragrance',
            'Hair Care',
            'Make Up',
            'Men Grooming',
            'Oral Care',
            'Skin Care',
            'Maternity Care',
            'Nursing & Feeding',
            'Sexual Wellness & Sensuality',
            'Tools & Accessories'
        ]
    },
    {
        'category': 'Food and Beverages',
        'subCategories': [
            'Baklava',
            'Bao',
            'Barbecue',
            'Biryani',
            'Bread',
            'Burger',
            'Cakes',
            'Chaat',
            'Cheesecakes',
            'Chicken',
            'Chicken wings',
            'Chips',
            'Coffee',
            'Cookies',
            'Crepes',
            'Dal',
            'Desserts',
            'Dhokla',
            'Dosa',
            'Doughnuts',
            'Eggs',
            'Energy Drinks',
            'Falafel',
            'Fresh Juice',
            'Fries',
            'Ice cream',
            'Idli',
            'Kabab',
            'Kachori',
            'Kulfi',
            'Lassi',
            'Meal bowl',
            'Mezze',
            'Mithai',
            'Momos',
            'Mutton',
            'Nachos',
            'Noodles',
            'Pakodas',
            'Pancakes',
            'Paneer',
            'Pasta',
            'Pastries',
            'Pie',
            'Pizza',
            'Poha',
            'Raita',
            'Rice',
            'Rolls',
            'Roti',
            'Salad',
            'Samosa',
            'Sandwich',
            'Seafood',
            'Shakes & Smoothies',
            'Soft Drink',
            'Soup',
            'Spring Roll',
            'Sushi',
            'Tacos',
            'Tandoori',
            'Tart',
            'Tea',
            'Thali',
            'Tikka',
            'Upma',
            'Uttapam',
            'Vada',
            'Vegetables',
            'Waffle',
            'Wrap',
            'Yogurt',
        ]
    }
];


const Attributes = [
    {
        'category': 'Electronics',
        'subCategory': 'Audio',
        'attributes': [
            { 'name': 'Color', 'type': 'text', 'example': 'Red,Blue', 'variationAllowed': true }
        ]
    },
    {
        'category': 'Electronics',
        'subCategory': 'Camera and Camcorder',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'Small', 'variationAllowed': true },
            { 'name': 'Compact', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': 'Small', 'variationAllowed': true },
            { 'name': 'Full-Size', 'type': 'text', 'example': 'Small', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': 'Small', 'variationAllowed': false },
            { 'name': 'stylename', 'type': 'text', 'example': 'Small', 'variationAllowed': false }
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Computer Peripheral',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'stylename', 'type': 'text', 'example': '', 'variationAllowed': true }
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Desktop and Laptop',
        'attributes': [
            { 'name': 'Item Weight', 'unit': unitWeight, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Wattage', 'unit': unitWattage, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Voltage', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Team Name', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Display weight', 'unit': unitWeight, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Memory Storage Capacity', 'unit': unitMemory, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Product Grade', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Hardware Platform', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Hard Drive Size', 'unit': unitMemory, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Screen Size', 'unit': unitLength, 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Earphone',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Edition', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Gaming',
        'attributes': [
            { 'name': 'Item Weight', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'numberer', 'example': '', 'variationAllowed': true },
            { 'name': 'Wattage', 'unit': unitWattage, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model Number', 'type': 'number', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Headphone',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Mobile Phone',
        'attributes': [
            { 'name': 'Memory', 'unit': unitMemory, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'unit': unitWeight, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'numberer', 'example': '', 'variationAllowed': true },
            { 'name': 'Team Name', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model Number', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Product Grade', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Screen Size Unit Of Measure', 'unit': unitLength, 'type': 'text', 'example': '', 'variationAllowed': true }
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Mobile Accessories',
        'attributes': [
            { 'name': 'Pattern', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'numberer', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'unit': unitWeight, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Thickness', 'unit': unitLength, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model Number', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Screen Size Unit Of MeasureScreen', 'unit': unitLength, 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Safety Security',
        'attributes': [
            { 'name': 'Style Name', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'numberer', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Pattern', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Display Weight', 'unit': unitWeight, 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Smart Watches',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'numberer', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'DriveMemory Storage Capacity', 'unit': unitMemory, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model Number', 'unit': unitWeight, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Band Colour', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Screen Size Unit Of MeasureScreen', 'unit': unitLength, 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Speaker',
        'attributes': [

        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Television',
        'attributes': [
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'DriveMemory Storage Capacity', 'unit': unitMemory, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'unit': unitWeight, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'numberer', 'example': '', 'variationAllowed': true },
            { 'name': 'Model Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Wattage', 'unit': unitWattage, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Voltage', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Team Name', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Display Size', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Video',
        'attributes': [
            { 'name': 'Style Name', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Health, Home and Personal Care',
        'attributes': [
            { 'name': 'Item Display Length', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'numberer', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Package Type', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Display', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Width', 'type': 'text', 'example': '', 'unit': unitLength },
            { 'name': 'Patter', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Display Height', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Display Diameter', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'model', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Wattage', 'type': 'text', 'example': '', 'unit': unitWattage },
            { 'name': 'Unit Count', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Air Conditioning and Air Cleaners',
        'attributes': [
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'numberer', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'unit': unitWeight, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Wattage', 'unit': unitWattage, 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Voltage', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Heaters',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '', 'unit': unitWeight },
            { 'name': 'Wattage', 'type': 'text', 'example': '', 'unit': unitWattage },
            { 'name': 'Voltage', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'model', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'number', 'example': '', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Kitchen Appliances',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'Large', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'Steel', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '2,3', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '3.3', 'unit': unitWeight },
            { 'name': 'Unit Count', 'type': 'number', 'example': '1', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Lighting & Electric Fans',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'Large', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'Modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '', 'unit': unitWeight },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'Steel', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Wattage', 'type': 'text', 'example': '', 'unit': unitWattage },
            { 'name': 'Unit Count', 'type': 'number', 'example': '5', 'variationAllowed': true },
            { 'name': 'Voltage', 'type': 'number', 'example': '5', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Refrigerators and Freezers',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '4', 'unit': unitWeight },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Capacity', 'type': 'text', 'example': '', 'unit': unitCapacity },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'LG12', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Vacuum Cleaners',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '4', 'unit': unitWeight },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Capacity', 'type': 'text', 'example': '', 'unit': unitCapacity },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'LG12', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Washing Machines and Accessories',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '4', 'unit': unitWeight },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Capacity', 'type': 'text', 'example': '', 'unit': unitCapacity },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'LG12', 'variationAllowed': true },
        ]
    }, {
        'category': 'Electronics',
        'subCategory': 'Water Purifiers and Coolers',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Graduation Interval', 'type': 'text', 'example': '', 'unit': unitGraduation },
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '4', 'unit': unitWeight },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Capacity', 'type': 'text', 'example': '', 'unit': unitCapacity },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'LG12', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Fruits and Vegetables',
        'attributes': [

        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Masala & Seasoning',
        'attributes': [

        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Oil & Ghee',
        'attributes': [

        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Gourmet & World Foods',
        'attributes': [

        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Foodgrains',
        'attributes': [

        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Eggs, Meat & Fish',
        'attributes': [

        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Cleaning & Household',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'plastic', 'variationAllowed': true },
            { 'name': 'Width Range', 'type': 'text', 'example': '', 'unit': unitLength },
            { 'name': 'Length Range', 'type': 'text', 'example': '', 'unit': unitLength },
        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Beverages',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'stylename', 'type': 'text', 'example': '', 'variationAllowed': true }
        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Beauty & Hygiene',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'rose', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '1', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB12', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Bakery, Cakes & Dairy',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'floor', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': 'Round', 'variationAllowed': true },
            { 'name': 'Capacity', 'type': 'float', 'example': '4', 'unit': unitCapacity },
            { 'name': 'Manufacturer Part Number', 'type': 'float', 'example': 'A-112', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Kitchen Accessories',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'Steel', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'Pattern', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Baby Care',
        'attributes': [
            { 'name': 'Scent', 'type': 'text', 'example': 'rose', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'rose', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'rose', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '1', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Pattern', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Snacks & Branded Foods',
        'attributes': [

        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Pet Care',
        'attributes': [
            { 'name': 'Scent Name', 'type': 'text', 'example': 'mild', 'variationAllowed': true },
            { 'name': 'Flavor', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': 'brown', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Grocery',
        'subCategory': 'Stationery',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'A4,6x4', 'variationAllowed': true },
            { 'name': 'Paper Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Line Size', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Maximum Size', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    },

    {
        'category': 'Home Decor',
        'subCategory': 'Home Decor',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Pattern', 'type': 'text', 'example': 'Sripped', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'float', 'example': 'A-112', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Wattage', 'type': 'text', 'example': '', 'unit': unitWattage },
            { 'name': 'VoltageColor', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': 'Round', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Home Decor',
        'subCategory': 'Home Furnishings',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Pattern', 'type': 'text', 'example': 'Sripped', 'variationAllowed': true },
            { 'name': 'Display Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
        ]
    },
    {
        'category': 'Home Decor',
        'subCategory': 'Furniture',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Pattern', 'type': 'text', 'example': 'Sripped', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Team Name', 'type': 'text', 'example': 'chennai super kings', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': 'Round', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Home Decor',
        'subCategory': 'Garden and Outdoor Products',
        'attributes': [
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Home Decor',
        'subCategory': 'Home Improvement',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Home Decor',
        'subCategory': 'Cookware and Dining',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Pattern', 'type': 'text', 'example': 'Sripped', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': 'Round', 'variationAllowed': true },
            { 'name': 'Capacity', 'type': 'text', 'example': '', 'unit': unitCapacity },
            { 'name': 'Manufacturer Part Number', 'type': 'float', 'example': 'A-112', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Home Decor',
        'subCategory': 'Storage and Organisation',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Team Name', 'type': 'text', 'example': 'Lions', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': 'Round', 'variationAllowed': true },
        ]
    },


    {
        'category': 'Health and Wellness',
        'subCategory': 'Pain Relieving Ointments',
        'attributes': [
            { 'name': 'Style', 'type': 'text', 'example': 'Art Deco', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'Metal', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'Large', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'float', 'example': 'A-112', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': 'Grey', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Health and Wellness',
        'subCategory': 'Nutrition and Supplements',
        'attributes': [
            { 'name': 'Flavour', 'type': 'text', 'example': 'Strawberry', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'musk', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'EEPL 456', 'variationAllowed': true },
        ]
    },

    {
        'category': 'Health and Wellness',
        'subCategory': 'Personal and Baby Care',
        'attributes': [
            { 'name': 'Scent', 'type': 'text', 'example': 'musk', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Itrm Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'EEPL 456', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Health and Wellness',
        'subCategory': 'Sexual Wellness',
        'attributes': [
            { 'name': 'Scent', 'type': 'text', 'example': 'musk', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'EEPL 456', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Health and Wellness',
        'subCategory': 'Gastric and Other Concerns',
        'attributes': [
            { 'name': 'Flavour', 'type': 'text', 'example': 'Strawberry', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'musk', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'EEPL 456', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Health and Wellness',
        'subCategory': 'Covid Essentials',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'Cape Cod', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'number', 'example': 'Cotton', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model', 'type': 'text', 'example': 'EEPL 456', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': 'RTC 54', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'number', 'example': '4', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Team Name', 'type': 'text', 'example': 'Royal', 'variationAllowed': true },
            { 'name': 'Item Shape', 'type': 'text', 'example': 'Molded cup', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Health and Wellness',
        'subCategory': 'Diabetes Control',
        'attributes': [
            { 'name': 'Flavour', 'type': 'text', 'example': 'Strawberry', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'musk', 'variationAllowed': true },
            { 'name': 'Item Package Quantity', 'type': 'number', 'example': '6', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Health and Wellness',
        'subCategory': 'Health Devices',
        'attributes': [
            { 'name': 'Thickness', 'type': 'text', 'example': '11', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'Steel', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'EEPL 456', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': 'Round', 'variationAllowed': true },
            { 'name': 'Capacity', 'type': 'text', 'example': '5', 'unit': unitCapacity },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': 'RTC 54', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    },

    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Bath & Body',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'Musk', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Feminine Care',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'musk', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Optical Power', 'type': 'text', 'example': '5', 'unit': unitOptical },
            { 'name': 'Color', 'type': 'text', 'example': 'Blue', 'variationAllowed': true },
            { 'name': 'Base Curve Radius', 'type': 'text', 'example': '5', 'unit': unitLength },
            { 'name': 'Item Diameter', 'type': 'text', 'example': '5', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Flavour', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Model Number', 'type': 'text', 'example': 'ER 44', 'variationAllowed': true },
            { 'name': 'Lens Addition Power', 'type': 'text', 'example': '', 'unit': unitLensPower },
            { 'name': 'Cylinder Correction', 'type': 'text', 'example': '', 'variationAllowed': true },
            { 'name': 'Cylinder Axis', 'type': 'text', 'example': 'Sripped', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Fragrance',
        'attributes': [
            { 'name': 'Style Name', 'type': 'text', 'example': 'Mision', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'Rose', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Gas', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model Number', 'type': 'text', 'example': 'TTYU 6', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': 'TTYU 6', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'number', 'example': '4', 'variationAllowed': true },
            { 'name': 'Volume', 'type': 'text', 'example': 'AB-12', 'unit': unitGraduation },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Hair Care',
        'attributes': [
            { 'name': 'Scent Name', 'type': 'text', 'example': 'Spice', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': 'Red', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model Number', 'type': 'text', 'example': 'TTYU 6', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Make Up',
        'attributes': [
            { 'name': 'Scent', 'type': 'text', 'example': 'Spice', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': 'Red', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model Number', 'type': 'text', 'example': 'TTYU 6', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Men Grooming',
        'attributes': [
            { 'name': 'Scent', 'type': 'text', 'example': 'Spice', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': 'Red', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Model Number', 'type': 'text', 'example': 'TTYU 6', 'variationAllowed': true },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Team Name', 'type': 'number', 'example': 'Royal', 'variationAllowed': true }
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Oral Care',
        'attributes': [
            { 'name': 'Flavour', 'type': 'text', 'example': 'Mint', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Scent', 'type': 'text', 'example': 'Musk', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': 'Red', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Skin Care',
        'attributes': [
            { 'name': 'Scent', 'type': 'text', 'example': 'Musk', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Maternity Care',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Color', 'type': 'text', 'example': '', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Nursing & Feeding',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'Small', 'variationAllowed': true },
            { 'name': 'Shape', 'type': 'text', 'example': 'Round', 'variationAllowed': true },
            { 'name': 'Pattern', 'type': 'text', 'example': 'Striped', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Sexual Wellness & Sensuality',
        'attributes': [
            { 'name': 'Scent', 'type': 'text', 'example': 'musk', 'variationAllowed': true },
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Form', 'type': 'text', 'example': 'Cream', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'PPU Count', 'type': 'text', 'example': '6', 'variationAllowed': true },
            { 'name': 'Model', 'type': 'text', 'example': 'EEPL 456', 'variationAllowed': true },
        ]
    },
    {
        'category': 'Beauty & Personal Care',
        'subCategory': 'Tools & Accessories',
        'attributes': [
            { 'name': 'Size', 'type': 'text', 'example': 'small', 'variationAllowed': true },
            { 'name': 'Style', 'type': 'text', 'example': 'modern', 'variationAllowed': true },
            { 'name': 'Number of Items', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Material Type', 'type': 'text', 'example': 'wood', 'variationAllowed': true },
            { 'name': 'Item Weight', 'type': 'text', 'example': '5', 'unit': unitWeight },
            { 'name': 'Model', 'type': 'text', 'example': 'AB-12', 'variationAllowed': true },
            { 'name': 'Unit Count', 'type': 'number', 'example': '6', 'variationAllowed': true },
            { 'name': 'Item Shape', 'type': 'text', 'example': 'Round', 'variationAllowed': true },
            { 'name': 'Manufacturer Part Number', 'type': 'text', 'example': 'ABT 243', 'variationAllowed': true },
        ]
    },

    {
        'category': 'Food and Beverages',
        'subCategory': 'Food and Beverages',
        'attributes': [

        ]
    },

];

module.exports = {
    Categories, SubCategories, Attributes
};
