/* Adapted from line-store-platform static/js/signature-pad.js — same fixed-
   resolution canvas approach, but exposed as a factory since this SPA has
   no <form> submit step to hook into. */
function createSignaturePad(canvasId, clearBtnId) {
  var canvas = document.getElementById(canvasId);
  var ctx = canvas.getContext("2d");
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1e293b";

  var drawing = false;
  var hasDrawn = false;
  var lastX = 0;
  var lastY = 0;

  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var point = e.touches && e.touches.length ? e.touches[0] : e;
    return {
      x: (point.clientX - rect.left) * scaleX,
      y: (point.clientY - rect.top) * scaleY,
    };
  }
  function start(e) {
    e.preventDefault();
    drawing = true;
    hasDrawn = true;
    var pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    var pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  }
  function end() { drawing = false; }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  var clearBtn = document.getElementById(clearBtnId);
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasDrawn = false;
    });
  }

  return {
    isEmpty: function () { return !hasDrawn; },
    toDataURL: function () { return canvas.toDataURL("image/png"); },
    reset: function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasDrawn = false;
    },
  };
}
