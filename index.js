const fs = require('fs');

const stopWordsString = fs.readFileSync('./stopwords.txt', 'utf8');
const stopWords = stopWordsString.split('\n');
const stopWordsSet = new Set();
stopWords.forEach((stopWord) => {
    if (!stopWordsSet.has(stopWord)) {
        stopWordsSet.add(stopWord);
    }
});

const enableStopWordFilter = true;

// example words: ['iphone', 'fix']
function buildSearchTermsOfWords(words) {
    words.sort();
    const res = [];
    const map = {};
    for (let i = 0; i < words.length; i++) {
        for (let j = 0; j < words[i].length; j++) {
            const newWords = [...words];
            newWords[i] = words[i].substring(0, j+1);
            newWords.sort();
            const newString = newWords.join(' ');
            if (!(newString in map)) {
                map[newString] = true;
                res.push(newWords.join(' '));
            }
        }
    }
    return res;
}

// example term: 'iphone fix screen'
function buildSearchTermsOfATerm(term) {
    const words = term.split(' ');
    const len = words.length;
    let res = [];
    for (let i = 1; i <= len; i++) {
        for (let j = 0; j + i <= len; j++) {
            let subwords = words.slice(j, j+i);
            if (enableStopWordFilter) {
                subwords = subwords.filter(word => !stopWordsSet.has(word));
            }
            res = [...res, ...buildSearchTermsOfWords(subwords)];
        }
    }
    return res;
}

function buildAllSearchTerms(terms) {
    const res = new Set();
    terms.forEach((term) => {
        builtTerms = buildSearchTermsOfATerm(term);
        builtTerms.forEach((t) => {
            if (!res.has(t)) {
                res.add(t);
            }
        });
    });
    return res;
}

//===========================debug===================================
// console.log(buildSearchTermsOfATerm('charles county parks and recreation'));

//===========================main script=============================
const dataString = fs.readFileSync('./dataset.txt', 'utf8');
const terms = dataString.split('\n');

const trainData = terms.slice(0, 39000);
const testData = terms.slice(39000, 40000);

const searchTermSet = buildAllSearchTerms(trainData);

let total = 0;
let found = 0;
let foundedQueries = [];
for (let i = 0; i <  testData.length; i++) {
    for (let j = 0; j < testData[i].length; j++) {
        const query = testData[i].substring(0, j+1);
        const sortedQuery = query.trim().split(' ').sort().join(' ');
        total += 1;
        if (searchTermSet.has(sortedQuery)) {
            found += 1;
            foundedQueries.push(query);
        }
    }
}

console.log('search term set size', searchTermSet.size);
console.log('total queries', total);
console.log('number of queries with suggestions', found);
console.log('percent of queries with suggestions', found / total);

const out = fs.createWriteStream('queriesWithSuggestionsV2.txt');
foundedQueries.forEach(function(v) { out.write(v + '\n'); });
out.end();