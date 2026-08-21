/* Ported from line-store-platform static/js/kiosk-keypad.js verbatim. */
(function () {
  "use strict";
  Array.prototype.forEach.call(document.querySelectorAll("[data-keypad-target]"), function (pad) {
    var target = document.querySelector(pad.getAttribute("data-keypad-target"));
    if (!target) return;
    var maxLen = parseInt(pad.getAttribute("data-keypad-maxlen"), 10) || 20;

    pad.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || !pad.contains(btn)) return;

      if (btn.hasAttribute("data-keypad-clear")) {
        target.value = "";
      } else if (btn.hasAttribute("data-keypad-back")) {
        target.value = target.value.slice(0, -1);
      } else if (target.value.length < maxLen) {
        target.value += btn.textContent.trim();
      }
      target.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
})();
