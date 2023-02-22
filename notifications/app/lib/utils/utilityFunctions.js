import bcrypt from 'bcryptjs';
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

exports.asyncForEach = asyncForEach;

exports.encryptPIN = (PIN) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(PIN, 10, (err, hash) => {
            if (err) reject(err);
            else {
                resolve(hash);
            }
        });
    });
};

exports.isValidPIN = (PIN, userPIN) => {
    return new Promise((resolve) => {
        bcrypt.compare(PIN, userPIN).then((match) => {
            if (!match) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

function combinations(array) {
    if (array.length === 0)
        return [];
    if (array.length === 1)
        return [[], array];
    const smaller = combinations(array.slice(1));
    return smaller.map(i => [i, [array[0], ...i]]).flat();
}

exports.combinations = combinations;

exports.pad = (num, places) => {
    const diff = places - num.toString().length;
    if (diff <= 0)
        return num.toString();
    return Array(diff).fill('0').join('') + num.toString();
};
