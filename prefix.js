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

// example term: 'iphone fix screen'
function buildSearchTermsOfATerm(term) {
    let words = term.split(' ');
    if (enableStopWordFilter) {
        words = words.filter(word => !stopWordsSet.has(word));
    }
    const newTerm = words.join(' ');
    const res = [];
    for (let i = 0; i < newTerm.length; i++) {
        res.push(newTerm.substring(0, i+1));
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

//===========================main script=============================
const dataString = fs.readFileSync('./dataset.txt', 'utf8');
const terms = dataString.split('\n');

const trainData = terms.slice(0, 39000);
const testData = terms.slice(39000, 40000);

const searchTermSet = buildAllSearchTerms(trainData);

let total = 0;
let found = 0;
let foundedQueries = {};
for (let i = 0; i <  testData.length; i++) {
    for (let j = 0; j < testData[i].length; j++) {
        let query = testData[i].substring(0, j+1);
        total += 1;
        if (searchTermSet.has(query)) {
            found += 1;
            foundedQueries[testData[i]] = query;
        } else if (!(testData[i] in foundedQueries)) {
            foundedQueries[testData[i]] = 'N/A';
        }
    }
}

console.log('search term set size', searchTermSet.size);
console.log('total queries', total);
console.log('number of queries with suggestions', found);
console.log('percent of queries with suggestions', found / total);

const out = fs.createWriteStream('queriesWithSuggestionsPrefix.txt');
for (let key in foundedQueries) {
    out.write(`${key} ---> ${foundedQueries[key]}\n`);
}
out.end();