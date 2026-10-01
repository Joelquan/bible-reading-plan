/* FreeBiblePlan page logic */
(function() {
  "use strict";

  var planKey = "year";
  var dailyMin = 30;
  var speed = 1;
  var scheduleEl = document.getElementById("schedule");
  var startInput = document.getElementById("startDate");
  var blurbEl = document.getElementById("planBlurb");
  var titleEl = document.getElementById("scheduleTitle");
  var progressEl = document.getElementById("progressLabel");
  var timePicker = document.getElementById("timePicker");
  var timeVerb = document.getElementById("timeVerb");
  var timeResult = document.getElementById("timeResult");

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function fmtDate(iso, offset) {
    var parts = iso.split("-");
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10) + offset);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return { label: days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate(),
             long: months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(),
             iso: d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) };
  }

  function fmtDur(min) {
    if (min < 60) return min + " min";
    var h = Math.floor(min / 60), m = min % 60;
    return h + " hour" + (h > 1 ? "s" : "") + (m ? " " + m + " min" : "");
  }

  function storeKey() {
    var plan = PLANS[planKey];
    return "fbp_" + planKey + "_" + (plan.timeBased ? dailyMin + "_" + speed + "_" : "") + startInput.value;
  }

  function readChecks() {
    try { return JSON.parse(localStorage.getItem(storeKey()) || "[]"); }
    catch (e) { return []; }
  }
  function writeChecks(arr) {
    try { localStorage.setItem(storeKey(), JSON.stringify(arr)); } catch (e) {}
  }

  /* Normalize a day entry to { chapters, minutes|null }. */
  function dayEntries(plan) {
    if (plan.timeBased) return buildTimePlan(plan.totalMin, dailyMin, planKey === "audio" ? speed : 1);
    return buildPlan(plan.list(), plan.days).map(function(ch) {
      return { chapters: ch, minutes: null };
    });
  }

  function trimNum(n) {
    var r = Math.round(n * 10) / 10;
    return (r % 1 === 0) ? String(Math.round(r)) : String(r);
  }
  function friendlyDays(days) {
    if (days < 45) {
      var w = days / 7;
      return "about " + trimNum(w) + " week" + (w === 1 ? "" : "s");
    }
    var m = days / 30.44;
    return "about " + trimNum(m) + " month" + (m === 1 ? "" : "s");
  }

  function render() {
    var plan = PLANS[planKey];
    var startISO = startInput.value || todayISO();

    if (plan.timeBased) {
      timePicker.hidden = false;
      document.getElementById("speedRow").hidden = (planKey !== "audio");
      timeVerb.textContent = plan.unit === "listening" ? "listen" : "read";
      var totalH = Math.round(plan.totalMin / 60);
      blurbEl.textContent = "About " + totalH + " hours of " + plan.unit + " in total. Pick your daily time below.";
    } else {
      timePicker.hidden = true;
      blurbEl.textContent = plan.blurb;
    }

    var entries = dayEntries(plan);
    var days = entries.length;
    var checks = readChecks();
    var today = todayISO();

    if (plan.timeBased) {
      var end = fmtDate(startISO, days - 1);
      var speedNote = (planKey === "audio" && speed !== 1) ? " at " + speed + "x speed" : "";
      timeResult.innerHTML = "At <strong>" + fmtDur(dailyMin) + " a day</strong>" + speedNote +
        ", you finish in about <strong>" + days + " days</strong> (" + friendlyDays(days) + "), on " + end.long + ".";
      titleEl.textContent = plan.name + ": " + fmtDur(dailyMin) + " a day, starting " + fmtDate(startISO, 0).label;
    } else {
      titleEl.textContent = plan.name + " starting " + fmtDate(startISO, 0).label;
    }

    scheduleEl.innerHTML = "";
    var frag = document.createDocumentFragment();
    var done = 0;
    entries.forEach(function(entry, i) {
      var dt = fmtDate(startISO, i);
      var isDone = checks.indexOf(i) >= 0;
      if (isDone) done++;
      var li = document.createElement("li");
      li.className = "day" + (dt.iso === today ? " today" : "") + (isDone ? " done" : "");

      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = isDone;
      box.setAttribute("aria-label", "Mark day " + (i + 1) + " complete");
      box.addEventListener("change", function() {
        var c = readChecks();
        var at = c.indexOf(i);
        if (box.checked && at < 0) c.push(i);
        if (!box.checked && at >= 0) c.splice(at, 1);
        writeChecks(c);
        li.classList.toggle("done", box.checked);
        progressEl.textContent = c.length + " of " + days + " days complete";
      });

      var meta = document.createElement("div");
      meta.className = "day-meta";
      var d1 = document.createElement("span");
      d1.className = "day-num";
      d1.textContent = "Day " + (i + 1);
      var d2 = document.createElement("span");
      d2.className = "day-date";
      d2.textContent = dt.label;
      meta.appendChild(d1);
      meta.appendChild(d2);

      var reading = document.createElement("span");
      reading.className = "day-reading";
      reading.textContent = (entry.minutes != null ? "\u2248" + entry.minutes + " min \u00B7 " : "") +
        formatDay(entry.chapters);

      li.appendChild(box);
      li.appendChild(meta);
      li.appendChild(reading);
      frag.appendChild(li);
    });
    scheduleEl.appendChild(frag);
    progressEl.textContent = done + " of " + days + " days complete";
  }

  document.querySelectorAll(".plan-card").forEach(function(card) {
    card.addEventListener("click", function() {
      document.querySelectorAll(".plan-card").forEach(function(c) {
        c.classList.remove("selected");
        c.setAttribute("aria-checked", "false");
      });
      card.classList.add("selected");
      card.setAttribute("aria-checked", "true");
      planKey = card.getAttribute("data-plan");
      render();
    });
  });

  document.querySelectorAll("#speedPresets button").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll("#speedPresets button").forEach(function(b) { b.classList.remove("on"); });
      btn.classList.add("on");
      speed = parseFloat(btn.getAttribute("data-speed"));
      render();
    });
  });

  document.querySelectorAll("#timePresets button").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll("#timePresets button").forEach(function(b) { b.classList.remove("on"); });
      btn.classList.add("on");
      dailyMin = parseInt(btn.getAttribute("data-min"), 10);
      document.getElementById("customHours").value = Math.floor(dailyMin / 60);
      document.getElementById("customMins").value = dailyMin % 60;
      render();
    });
  });

  document.getElementById("customSet").addEventListener("click", function() {
    var h = parseInt(document.getElementById("customHours").value, 10) || 0;
    var m = parseInt(document.getElementById("customMins").value, 10) || 0;
    var total = h * 60 + m;
    if (total < 1) total = 1;
    if (total > 720) total = 720;
    dailyMin = total;
    document.querySelectorAll("#timePresets button").forEach(function(b) {
      b.classList.toggle("on", parseInt(b.getAttribute("data-min"), 10) === total);
    });
    render();
  });

  startInput.value = todayISO();
  startInput.addEventListener("change", render);

  document.getElementById("printBtn").addEventListener("click", function() {
    window.print();
  });

  document.getElementById("resetBtn").addEventListener("click", function() {
    try { localStorage.removeItem(storeKey()); } catch (e) {}
    render();
  });

  render();
})();
