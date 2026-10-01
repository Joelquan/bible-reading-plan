/* FreeBiblePlan page logic */
(function() {
  "use strict";

  var planKey = "year";
  var scheduleEl = document.getElementById("schedule");
  var startInput = document.getElementById("startDate");
  var blurbEl = document.getElementById("planBlurb");
  var titleEl = document.getElementById("scheduleTitle");
  var progressEl = document.getElementById("progressLabel");

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
             iso: d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) };
  }

  function storeKey() { return "fbp_" + planKey + "_" + startInput.value; }

  function readChecks() {
    try { return JSON.parse(localStorage.getItem(storeKey()) || "[]"); }
    catch (e) { return []; }
  }
  function writeChecks(arr) {
    try { localStorage.setItem(storeKey(), JSON.stringify(arr)); } catch (e) {}
  }

  function render() {
    var plan = PLANS[planKey];
    var days = buildPlan(plan.list(), plan.days);
    var startISO = startInput.value || todayISO();
    var checks = readChecks();
    var today = todayISO();

    blurbEl.textContent = plan.blurb;
    titleEl.textContent = plan.name + " starting " + fmtDate(startISO, 0).label;

    scheduleEl.innerHTML = "";
    var frag = document.createDocumentFragment();
    var done = 0;
    days.forEach(function(chapters, i) {
      var dt = fmtDate(startISO, i);
      var li = document.createElement("li");
      li.className = "day" + (dt.iso === today ? " today" : "") + (checks.indexOf(i) >= 0 ? " done" : "");
      if (checks.indexOf(i) >= 0) done++;

      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = checks.indexOf(i) >= 0;
      box.setAttribute("aria-label", "Mark day " + (i + 1) + " complete");
      box.addEventListener("change", function() {
        var c = readChecks();
        var at = c.indexOf(i);
        if (box.checked && at < 0) c.push(i);
        if (!box.checked && at >= 0) c.splice(at, 1);
        writeChecks(c);
        li.classList.toggle("done", box.checked);
        progressEl.textContent = c.length + " of " + days.length + " days complete";
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
      reading.textContent = formatDay(chapters);

      li.appendChild(box);
      li.appendChild(meta);
      li.appendChild(reading);
      frag.appendChild(li);
    });
    scheduleEl.appendChild(frag);
    progressEl.textContent = done + " of " + days.length + " days complete";
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
