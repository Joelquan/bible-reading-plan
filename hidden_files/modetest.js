const fs = require("fs");
const planSrc = fs.readFileSync("/home/hatch/workspace/bible-reading-plan/assets/plan.js", "utf8").replace('"use strict";', '');
const appSrc = fs.readFileSync("/home/hatch/workspace/bible-reading-plan/assets/app.js", "utf8");

function makeEl(tag, attrs) {
  const el = {
    tag, children: [], listeners: {}, attrs: attrs || {},
    textContent: "", hidden: false, value: "", type: "",
    checked: false, className: "", style: {},
    _cls: new Set((attrs && attrs.class || "").split(" ").filter(Boolean)),
  };
  el.classList = {
    add: c => el._cls.add(c), remove: c => el._cls.delete(c),
    toggle: (c, f) => { if (f === undefined) f = !el._cls.has(c); f ? el._cls.add(c) : el._cls.delete(c); },
    contains: c => el._cls.has(c),
  };
  el.getAttribute = n => el.attrs[n];
  el.setAttribute = (n, v) => { el.attrs[n] = v; };
  el.appendChild = c => { el.children.push(c); return c; };
  el.addEventListener = (ev, fn) => { (el.listeners[ev] = el.listeners[ev] || []).push(fn); };
  el.click = () => { (el.listeners["click"] || []).forEach(fn => fn.call(el)); };
  Object.defineProperty(el, "innerHTML", { get() { return ""; }, set(v) { if (v === "") el.children = []; } });
  return el;
}

const byId = {};
["schedule","startDate","planBlurb","scheduleTitle","progressLabel","timePicker","timeVerb",
 "timeResult","speedRow","customHours","customMins","customSet","printBtn","resetBtn",
 "calWrap","calNav","calLabel","viewList","viewCal","calPrev","calNext",
 "heroCard","modeReading","modeListening"].forEach(id => { byId[id] = makeEl("div"); });

const cards = ["year","days90","chrono","readtime","audio"].map(k =>
  makeEl("button", { "data-plan": k, class: k === "year" ? "plan-card selected" : "plan-card" }));
const speedBtns = ["1","1.25","1.5","2"].map(s =>
  makeEl("button", { "data-speed": s, class: s === "1" ? "on" : "" }));

global.document = {
  getElementById: id => byId[id] || null,
  createElement: t => makeEl(t),
  createTextNode: t => { const e = makeEl("text"); e.textContent = t; return e; },
  createDocumentFragment: () => makeEl("frag"),
  querySelectorAll: sel => {
    if (sel === ".plan-card") return cards;
    if (sel === "#speedPresets button") return speedBtns;
    if (sel === "#timePresets button") return [];
    return [];
  },
};
global.window = {};
global.localStorage = { _s: {}, getItem(k){ return this._s[k] || null; }, setItem(k,v){ this._s[k]=v; }, removeItem(k){ delete this._s[k]; } };

eval(planSrc);
eval(appSrc);

const vis = () => cards.filter(c => c.style.display !== "none").map(c => c.getAttribute("data-plan"));
const sel = () => cards.find(c => c.classList.contains("selected")).getAttribute("data-plan");

console.log("init: hero mode-reading =", byId["heroCard"].classList.contains("mode-reading"), "(expect true)");
console.log("init: visible cards =", vis().join(","), "(expect year,days90,chrono,readtime)");
console.log("init: selected =", sel(), "(expect year)");

// pick 90 days, then go listening, then back: 90 days should be remembered
cards[1].click();
byId["modeListening"].click();
console.log("listening: hero mode-listening =", byId["heroCard"].classList.contains("mode-listening"), "(expect true)");
console.log("listening: visible cards =", vis().join(","), "(expect audio)");
console.log("listening: selected =", sel(), "(expect audio)");
console.log("listening: timePicker hidden =", byId["timePicker"].hidden, "(expect false)");
byId["modeReading"].click();
console.log("back: selected =", sel(), "(expect days90, remembered)");
console.log("back: visible cards =", vis().join(","), "(expect year,days90,chrono,readtime)");
console.log("back: hero mode-reading =", byId["heroCard"].classList.contains("mode-reading"), "(expect true)");
console.log("MODE TESTS DONE");
