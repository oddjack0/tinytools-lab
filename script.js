"use strict";

/* ---------- Pure calculation functions (also exported for Node tests) ---------- */

// What is X% of Y?
function pctOf(x, y) { return (x / 100) * y; }

// X is what % of Y?
function pctWhat(part, whole) { return whole === 0 ? NaN : (part / whole) * 100; }

// Percent change from old value to new value
function pctChange(from, to) { return from === 0 ? NaN : ((to - from) / from) * 100; }

// Compound interest. monthlyContribution is added at END of each month,
// after that month's growth. Growth uses the monthly-equivalent rate of the
// nominal annual rate compounded n times per year, so results match the
// closed-form A = P(1 + r/n)^(nt) exactly when contributions are 0.
function compoundInterest(principal, annualRatePct, years, compoundsPerYear, monthlyContribution) {
  var r = annualRatePct / 100;
  var months = Math.round(years * 12);
  var contributions = monthlyContribution * months;
  if (r === 0) {
    var flat = principal + contributions;
    return { final: flat, interest: 0, contributions: contributions };
  }
  var monthlyRate = Math.pow(1 + r / compoundsPerYear, compoundsPerYear / 12) - 1;
  var bal = principal;
  for (var i = 0; i < months; i++) {
    bal = bal * (1 + monthlyRate) + monthlyContribution;
  }
  return { final: bal, interest: bal - principal - contributions, contributions: contributions };
}

// Standard amortized mortgage: returns monthly payment, total interest, total paid.
function mortgage(loanAmount, annualRatePct, years) {
  var r = annualRatePct / 100 / 12;
  var n = Math.round(years * 12);
  if (loanAmount <= 0 || n <= 0) return { payment: 0, totalInterest: 0, totalPaid: 0 };
  var payment;
  if (r === 0) {
    payment = loanAmount / n;
  } else {
    var f = Math.pow(1 + r, n);
    payment = loanAmount * r * f / (f - 1);
  }
  var totalPaid = payment * n;
  return { payment: payment, totalInterest: totalPaid - loanAmount, totalPaid: totalPaid };
}

// Tip + split
function tipCalc(bill, tipPct, people) {
  var tip = bill * tipPct / 100;
  var total = bill + tip;
  var per = people > 0 ? total / people : NaN;
  return { tip: tip, total: total, per: per };
}

// Text statistics
function textStats(text) {
  var trimmed = text.trim();
  var words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  var chars = text.length;
  var noSpace = text.replace(/\s/g, "").length;
  var sentences = trimmed === "" ? 0 :
    trimmed.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length;
  var paras = trimmed === "" ? 0 :
    trimmed.split(/\n\s*\n/).filter(function (s) { return s.trim().length > 0; }).length;
  var readingMin = words === 0 ? 0 : Math.ceil(words / 200);
  return { words: words, chars: chars, noSpace: noSpace, sentences: sentences, paras: paras, readingMin: readingMin };
}

// Case conversions
function convertCase(text, mode) {
  switch (mode) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title":
      return text.toLowerCase().replace(/(^|\s)(\S)/g, function (m, p1, p2) {
        return p1 + p2.toUpperCase();
      });
    case "sentence":
      return text.toLowerCase().replace(/(^\s*[a-z])|([.!?]\s*[a-z])/g, function (m) {
        return m.toUpperCase();
      });
    case "alt":
      var out = "", upper = true;
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (/[a-zA-Z]/.test(ch)) {
          out += upper ? ch.toUpperCase() : ch.toLowerCase();
          upper = !upper;
        } else {
          out += ch;
        }
      }
      return out;
    default: return text;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { pctOf, pctWhat, pctChange, compoundInterest, mortgage, tipCalc, textStats, convertCase };
}

/* ---------- Browser wiring ---------- */
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    var $ = function (id) { return document.getElementById(id); };
    var money = function (v) {
      return isFinite(v) ? v.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—";
    };
    var num = function (id) { var v = parseFloat($(id).value); return isNaN(v) ? 0 : v; };
    var on = function (id, ev, fn) { var el = $(id); if (el) el.addEventListener(ev, fn); };

    /* Tabs */
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
    function activateTab(tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
        var panel = $(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activateTab(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var j = null;
        if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") j = 0;
        if (e.key === "End") j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); activateTab(tabs[j], true); }
      });
    });
    // Deep-link: #mortgage etc. opens that tab
    var hash = window.location.hash.replace("#", "");
    if (hash) {
      var match = tabs.filter(function (t) { return t.getAttribute("data-tab") === hash; })[0];
      if (match) activateTab(match, false);
    }

    /* 1. Percentage */
    function calcPct() {
      $("pct-result-1").textContent = num("pct-x") + "% of " + num("pct-y") + " = " +
        pctOf(num("pct-x"), num("pct-y")).toLocaleString("en-US", { maximumFractionDigits: 4 });
      var w = pctWhat(num("pct-part"), num("pct-whole"));
      $("pct-result-2").textContent = isNaN(w) ? "Cannot divide by zero" :
        num("pct-part") + " is " + w.toFixed(2) + "% of " + num("pct-whole");
      var c = pctChange(num("pct-from"), num("pct-to"));
      $("pct-result-3").textContent = isNaN(c) ? "Cannot divide by zero" :
        (c >= 0 ? "Increase of " : "Decrease of ") + Math.abs(c).toFixed(2) + "%";
    }
    ["pct-x", "pct-y", "pct-part", "pct-whole", "pct-from", "pct-to"].forEach(function (id) { on(id, "input", calcPct); });
    calcPct();

    /* 2. Compound interest */
    function calcCI() {
      var res = compoundInterest(num("ci-principal"), num("ci-rate"), num("ci-years"),
        parseInt($("ci-freq").value, 10), num("ci-monthly"));
      $("ci-final").textContent = money(res.final);
      $("ci-interest").textContent = money(res.interest);
      $("ci-contrib").textContent = money(res.contributions);
    }
    ["ci-principal", "ci-rate", "ci-years", "ci-monthly"].forEach(function (id) { on(id, "input", calcCI); });
    on("ci-freq", "change", calcCI);
    calcCI();

    /* 3. Mortgage */
    function calcMG() {
      var loan = Math.max(0, num("mg-price") - num("mg-down"));
      var res = mortgage(loan, num("mg-rate"), parseInt($("mg-term").value, 10));
      $("mg-loan").textContent = money(loan);
      $("mg-payment").textContent = money(res.payment);
      $("mg-interest").textContent = money(res.totalInterest);
      $("mg-total").textContent = money(res.totalPaid);
    }
    ["mg-price", "mg-down", "mg-rate"].forEach(function (id) { on(id, "input", calcMG); });
    on("mg-term", "change", calcMG);
    calcMG();

    /* 4. Tip */
    function calcTip() {
      var people = Math.max(1, Math.round(num("tip-people")));
      var res = tipCalc(num("tip-bill"), num("tip-pct"), people);
      $("tip-amount").textContent = money(res.tip);
      $("tip-total").textContent = money(res.total);
      $("tip-per").textContent = money(res.per);
    }
    ["tip-bill", "tip-pct", "tip-people"].forEach(function (id) { on(id, "input", calcTip); });
    document.querySelectorAll("[data-tip]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $("tip-pct").value = btn.getAttribute("data-tip");
        calcTip();
      });
    });
    calcTip();

    /* 5. Image resizer / compressor (fully client-side) */
    var imgState = { url: null, img: null, name: "image" };
    function fmtBytes(b) {
      if (b < 1024) return b + " B";
      if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
      return (b / (1024 * 1024)).toFixed(2) + " MB";
    }
    function processImage() {
      if (!imgState.img) return;
      var src = imgState.img;
      var targetW = parseInt($("img-width").value, 10);
      var scale = (targetW && targetW < src.naturalWidth) ? targetW / src.naturalWidth : 1;
      var w = Math.max(1, Math.round(src.naturalWidth * scale));
      var h = Math.max(1, Math.round(src.naturalHeight * scale));
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(src, 0, 0, w, h);
      var type = $("img-format").value;
      var quality = parseInt($("img-quality").value, 10) / 100;
      canvas.toBlob(function (blob) {
        if (!blob) return;
        var old = $("img-download").href;
        if (old && old.indexOf("blob:") === 0) URL.revokeObjectURL(old);
        var url = URL.createObjectURL(blob);
        var ext = type === "image/png" ? "png" : (type === "image/webp" ? "webp" : "jpg");
        var dl = $("img-download");
        dl.href = url;
        dl.download = imgState.name.replace(/\.[^.]+$/, "") + "-resized." + ext;
        dl.classList.remove("disabled");
        dl.setAttribute("aria-disabled", "false");
        $("img-new-preview").src = url;
        $("img-new-info").textContent = w + "×" + h + " px · " + fmtBytes(blob.size);
      }, type, quality);
    }
    on("img-file", "change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (imgState.url) URL.revokeObjectURL(imgState.url);
      imgState.url = URL.createObjectURL(file);
      imgState.name = file.name || "image";
      var im = new Image();
      im.onload = function () {
        imgState.img = im;
        $("img-orig-preview").src = imgState.url;
        $("img-orig-info").textContent = im.naturalWidth + "×" + im.naturalHeight +
          " px · " + fmtBytes(file.size);
        processImage();
      };
      im.src = imgState.url;
    });
    ["img-width", "img-format"].forEach(function (id) { on(id, "change", processImage); on(id, "input", processImage); });
    on("img-quality", "input", function () {
      $("img-quality-val").textContent = $("img-quality").value;
      processImage();
    });

    /* 6. Word counter */
    function calcWC() {
      var s = textStats($("wc-text").value);
      $("wc-words").textContent = s.words;
      $("wc-chars").textContent = s.chars;
      $("wc-nospace").textContent = s.noSpace;
      $("wc-sentences").textContent = s.sentences;
      $("wc-paras").textContent = s.paras;
      $("wc-reading").textContent = s.readingMin + " min";
    }
    on("wc-text", "input", calcWC);
    calcWC();

    /* 7. Case converter */
    document.querySelectorAll("[data-case]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ta = $("cc-text");
        ta.value = convertCase(ta.value, btn.getAttribute("data-case"));
        $("cc-status").textContent = "";
      });
    });
    on("cc-copy", "click", function () {
      var text = $("cc-text").value;
      function done() { $("cc-status").textContent = "Copied ✓"; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          $("cc-status").textContent = "Copy failed — select the text manually.";
        });
      } else {
        $("cc-text").select();
        try { document.execCommand("copy"); done(); }
        catch (e) { $("cc-status").textContent = "Copy failed — select the text manually."; }
      }
    });
  });
}
