exports.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

/**
 * Function to sort object keys by their values
 * @param {} obj
 */
exports.sortObjectPropertiesByValues = (obj) => {
    let arr = [];
    let prop;
    let sortedObj = {};

    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({'key': prop, 'value': obj[prop]});
        }
    }

    arr.sort((a, b) => {
        return a.value - b.value;
    });

    arr.forEach((ele) => {
        sortedObj[ele.key] = ele.value;
    });

    return sortedObj; // returns sorted object
}

/**
 * Function to sort object properties by their alphabetical order
 * @param {} obj
 * @param {*} order
 */
exports.sortObjectPropertiesByAlphabetialOrder = (obj, order = 'asc') => {
    let key;
    let tempArry = [];
    let i;
    let sortedObj = {};

    for (key in obj) {
        tempArry.push(key);
    }

    tempArry.sort((a, b) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }
    );

    if (order === 'desc') {
        for (i = tempArry.length - 1; i >= 0; i--) {
            sortedObj[tempArry[i]] = obj[tempArry[i]];
        }
    } else {
        for (i = 0; i < tempArry.length; i++) {
            sortedObj[tempArry[i]] = obj[tempArry[i]];
        }
    }
    return sortedObj;
}

/**
 * Function to return visible fields
 * @param {} obj
 * @param {*} order
 */
exports.getVisibleFields = (permission) => {

    const unique = (value, index, self) => {
        return self.indexOf(value) === index
    }

    console.log("permission===", permission);

    // Fields which are accessible to user
    let visibleFields = permission && permission.fields && permission.fields.map((field) => {
        return field.name;
    });

    console.log("visibleFields===", visibleFields);
    if (visibleFields) {
        visibleFields = visibleFields.filter(unique)
    }

    return visibleFields

}
