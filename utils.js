function sum(arr) {
    return arr.reduce((num, res) => res + num, 0);
}

function avg(arr) {
    return sum(arr) / arr.length;
}

function dotDiv(arr1, arr2) {
    const len1 = arr1.length;
    const len2 = arr2.length;
    if (len1 !== len2) {
        throw new Error('both arrays should have the same length');
    }
    const res = [];
    for (let i = 0; i < len1; i++) {
        res.push(arr1[i] / arr2[i]);
    }
    return res;
}

module.exports = {
    sum,
    avg,
    dotDiv,
};