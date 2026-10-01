/* FreeBiblePlan plan engine. KJV chapter counts verified: 66 books, 1189 chapters. */
"use strict";

var BOOKS = [
  ["Genesis", 50], ["Exodus", 40], ["Leviticus", 27], ["Numbers", 36], ["Deuteronomy", 34],
  ["Joshua", 24], ["Judges", 21], ["Ruth", 4], ["1 Samuel", 31], ["2 Samuel", 24],
  ["1 Kings", 22], ["2 Kings", 25], ["1 Chronicles", 29], ["2 Chronicles", 36],
  ["Ezra", 10], ["Nehemiah", 13], ["Esther", 10], ["Job", 42], ["Psalms", 150],
  ["Proverbs", 31], ["Ecclesiastes", 12], ["Song of Solomon", 8], ["Isaiah", 66],
  ["Jeremiah", 52], ["Lamentations", 5], ["Ezekiel", 48], ["Daniel", 12], ["Hosea", 14],
  ["Joel", 3], ["Amos", 9], ["Obadiah", 1], ["Jonah", 4], ["Micah", 7], ["Nahum", 3],
  ["Habakkuk", 3], ["Zephaniah", 3], ["Haggai", 2], ["Zechariah", 14], ["Malachi", 4],
  ["Matthew", 28], ["Mark", 16], ["Luke", 24], ["John", 21], ["Acts", 28],
  ["Romans", 16], ["1 Corinthians", 16], ["2 Corinthians", 13], ["Galatians", 6],
  ["Ephesians", 6], ["Philippians", 4], ["Colossians", 4], ["1 Thessalonians", 5],
  ["2 Thessalonians", 3], ["1 Timothy", 6], ["2 Timothy", 4], ["Titus", 3],
  ["Philemon", 1], ["Hebrews", 13], ["James", 5], ["1 Peter", 5], ["2 Peter", 3],
  ["1 John", 5], ["2 John", 1], ["3 John", 1], ["Jude", 1], ["Revelation", 22]
];

/* Book-level chronological order: books arranged in the order their
   events happened, chapters read straight through each book. */
var CHRONO_ORDER = [
  "Genesis", "Job", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Chronicles", "Psalms",
  "1 Kings", "2 Kings", "2 Chronicles", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Jonah", "Amos", "Hosea", "Isaiah", "Micah", "Nahum", "Zephaniah", "Habakkuk",
  "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Obadiah", "Joel",
  "Haggai", "Zechariah", "Esther", "Ezra", "Nehemiah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "James", "Galatians", "1 Thessalonians", "2 Thessalonians",
  "1 Corinthians", "2 Corinthians", "Romans",
  "Ephesians", "Philippians", "Colossians", "Philemon",
  "1 Timothy", "Titus", "1 Peter", "Hebrews", "2 Timothy", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

function bookChapters(name) {
  for (var i = 0; i < BOOKS.length; i++) {
    if (BOOKS[i][0] === name) return BOOKS[i][1];
  }
  return 0;
}

/* Flat list of [book, chapter] in the given book order. */
function chapterList(order) {
  var out = [];
  for (var i = 0; i < order.length; i++) {
    var n = bookChapters(order[i]);
    for (var c = 1; c <= n; c++) out.push([order[i], c]);
  }
  return out;
}

function canonList() {
  return chapterList(BOOKS.map(function(b) { return b[0]; }));
}

function chronoList() {
  return chapterList(CHRONO_ORDER);
}

/* Split the chapter list evenly across `days` days. Day i takes
   chapters [floor(i*T/days), floor((i+1)*T/days]). */
function buildPlan(list, days) {
  var total = list.length, plan = [];
  for (var d = 0; d < days; d++) {
    var a = Math.floor(d * total / days), b = Math.floor((d + 1) * total / days);
    plan.push(list.slice(a, b));
  }
  return plan;
}

/* "Genesis 48-50, Exodus 1-2" */
function formatDay(chapters) {
  var parts = [], cur = null;
  chapters.forEach(function(ch) {
    if (cur && cur[0] === ch[0] && ch[1] === cur[2] + 1) { cur[2] = ch[1]; }
    else { cur = [ch[0], ch[1], ch[1]]; parts.push(cur); }
  });
  return parts.map(function(p) {
    return p[0] + " " + (p[1] === p[2] ? p[1] : p[1] + "-" + p[2]);
  }).join(", ");
}

var PLANS = {
  year: {
    name: "Bible in a Year",
    days: 365,
    blurb: "About 3 chapters a day. The whole Bible, Genesis to Revelation, in 365 days.",
    list: canonList
  },
  days90: {
    name: "Bible in 90 Days",
    days: 90,
    blurb: "About 13 chapters a day. A fast, immersive read through the whole Bible.",
    list: canonList
  },
  chrono: {
    name: "Chronological",
    days: 365,
    blurb: "About 3 chapters a day, with the books arranged in the order their events happened.",
    list: chronoList
  }
};

if (typeof module !== "undefined") module.exports = { BOOKS: BOOKS, CHRONO_ORDER: CHRONO_ORDER, buildPlan: buildPlan, canonList: canonList, chronoList: chronoList, formatDay: formatDay, PLANS: PLANS };
