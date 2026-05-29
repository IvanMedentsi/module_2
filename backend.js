const natural = require("natural");
const TfIdf = natural.TfIdf;

function clean(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cosine(vecA, vecB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  keys.forEach(k => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;

    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  return magA && magB
    ? dot / (Math.sqrt(magA) * Math.sqrt(magB))
    : 0;
}

function vector(tfidf, index) {
  const v = {};
  tfidf.listTerms(index).forEach(t => {
    v[t.term] = t.tfidf;
  });
  return v;
}

function analyze(documents) {
  const tfidf = new TfIdf();

  const cleaned = documents.map(clean);

  cleaned.forEach(doc => tfidf.addDocument(doc));

  const results = [];

  for (let i = 0; i < cleaned.length; i++) {
    for (let j = i + 1; j < cleaned.length; j++) {
      const sim = cosine(
        vector(tfidf, i),
        vector(tfidf, j)
      );

      results.push({
        doc1: i + 1,
        doc2: j + 1,
        similarity: +(sim * 100).toFixed(2)
      });
    }
  }

  return results;
}

module.exports = { analyze };