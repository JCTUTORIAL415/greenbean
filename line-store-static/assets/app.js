(function () {
  "use strict";
  var ADMIN_PIN = window.STORE_ADMIN_PIN || "0000";
  var DATA = null;
  var STORAGE_KEY = null;

  fetch("data.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      DATA = data;
      STORAGE_KEY = "kiosk_signed_" + DATA.store_key;
      init();
    })
    .catch(function (err) {
      document.body.innerHTML =
        '<p style="padding:2rem;text-align:center;color:#c0392b;">資料載入失敗，請重新整理頁面或洽店員。</p>';
      console.error(err);
    });

  function init() {
    function loadSigned() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
      catch (e) { return {}; }
    }
    function saveSigned(map) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }

    function groupsByPhone(phone4) {
      var rows = DATA.orders.filter(function (o) { return o.phone4 === phone4; });
      var map = new Map();
      rows.forEach(function (o) {
        if (!map.has(o.name)) map.set(o.name, []);
        map.get(o.name).push(o);
      });
      return map;
    }

    var screens = {};
    document.querySelectorAll(".screen").forEach(function (el) {
      screens[el.dataset.screen] = el;
    });
    function show(name) {
      Object.keys(screens).forEach(function (k) { screens[k].classList.remove("active"); });
      screens[name].classList.add("active");
    }

    document.getElementById("store-name").textContent = DATA.store_name;

    // ---- search (keypad-driven, mirrors kiosk/lookup.html) ----
    var phoneInput = document.getElementById("phone4");
    var searchMsg = document.getElementById("search-msg");
    var currentGroups = null;
    var currentName = null;

    document.getElementById("lookup-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = phoneInput.value.trim();
      searchMsg.textContent = "";
      searchMsg.className = "flash flash-error kiosk-error";
      searchMsg.hidden = true;
      if (!/^\d{4}$/.test(v)) {
        searchMsg.textContent = "請用下方按鍵輸入 4 碼數字";
        searchMsg.hidden = false;
        return;
      }
      var groups = groupsByPhone(v);
      if (groups.size === 0) {
        searchMsg.textContent = "查無資料，請確認號碼或洽店員";
        searchMsg.hidden = false;
        return;
      }
      currentGroups = groups;
      if (groups.size === 1) {
        currentName = groups.keys().next().value;
        enterConfirm();
      } else {
        renderSelect(groups);
        show("select");
      }
    });

    // ---- select customer (mirrors kiosk/select_customer.html) ----
    var selectList = document.getElementById("select-list");
    var selectHeading = document.getElementById("select-heading");
    function renderSelect(groups) {
      selectHeading.textContent = "找到 " + groups.size + " 位符合的客戶";
      selectList.innerHTML = "";
      groups.forEach(function (rows, name) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-ghost kiosk-btn-lg";
        btn.style.justifyContent = "flex-start";
        btn.style.paddingLeft = "1.25rem";
        btn.textContent = "👤 " + name;
        btn.addEventListener("click", function () {
          currentName = name;
          enterConfirm();
        });
        selectList.appendChild(btn);
      });
    }
    document.getElementById("select-back").addEventListener("click", function () {
      show("search");
    });

    // ---- confirm order list (mirrors kiosk/confirm.html) ----
    var confirmHeading = document.getElementById("confirm-heading");
    var orderList = document.getElementById("order-list");
    var confirmTotal = document.getElementById("confirm-total");
    var alreadySignedBox = document.getElementById("already-signed-box");
    var confirmForm = document.getElementById("confirm-form");
    var confirmHint = document.getElementById("confirm-hint");
    var pendingRows = [];

    function enterConfirm() {
      var rows = currentGroups.get(currentName);
      var signedMap = loadSigned();
      var unsigned = rows.filter(function (o) { return !signedMap[o.id]; });
      var signed = rows.filter(function (o) { return signedMap[o.id]; });

      if (unsigned.length === 0) {
        var rec = signedMap[signed[0].id];
        renderAlreadySigned(rec, signed.length);
        show("confirm");
        orderList.hidden = true;
        confirmForm.hidden = true;
        confirmHint.hidden = true;
        confirmHeading.textContent = currentName + " 的訂單";
        return;
      }

      alreadySignedBox.hidden = true;
      orderList.hidden = false;
      confirmForm.hidden = false;
      confirmHint.hidden = false;
      pendingRows = unsigned;
      confirmHeading.textContent = "為您找到 " + unsigned.length + " 筆訂單";
      orderList.innerHTML = "";
      unsigned.forEach(function (o, idx) {
        var item = document.createElement("div");
        item.className = "kiosk-order-item";
        var itemsHtml = o.items.map(function (i) { return "<li>" + i + "</li>"; }).join("");
        item.innerHTML =
          '<label class="kiosk-order-check">' +
          '<input type="checkbox" checked data-order-idx="' + idx + '">' +
          '<span style="flex:1">' +
          '<span class="kiosk-order-activity">' + o.name + "</span><br>" +
          (o.note ? '<span class="kiosk-order-meta">' + o.note + "</span><br>" : "") +
          "<ul>" + itemsHtml + "</ul>" +
          '<span class="kiosk-order-amount">金額：' + o.amount + "</span>" +
          "</span></label>";
        orderList.appendChild(item);
      });
      orderList.querySelectorAll("input[type=checkbox]").forEach(function (cb) {
        cb.addEventListener("change", updateTotal);
      });
      updateTotal();
      if (signed.length > 0) {
        confirmHeading.textContent += "（另有 " + signed.length + " 筆已簽收，不會再顯示）";
      }
      show("confirm");
    }

    function renderAlreadySigned(rec, count) {
      alreadySignedBox.hidden = false;
      alreadySignedBox.innerHTML =
        '<div class="kiosk-signed-badge">已簽收 ' + rec.signedAt + "</div>" +
        '<p class="hint" style="text-align:center;margin-bottom:0.75rem;">共 ' + count + ' 筆項目已簽收完成，無需再簽</p>' +
        '<img class="kiosk-signed-img" src="' + rec.signature + '" alt="簽名" />';
    }

    function checkedRows() {
      var boxes = orderList.querySelectorAll("input[type=checkbox]");
      var out = [];
      boxes.forEach(function (cb) {
        var item = cb.closest(".kiosk-order-item");
        if (cb.checked) {
          item.classList.remove("is-unchecked");
          out.push(pendingRows[Number(cb.dataset.orderIdx)]);
        } else {
          item.classList.add("is-unchecked");
        }
      });
      return out;
    }
    function updateTotal() {
      var rows = checkedRows();
      var total = rows.reduce(function (s, o) { return s + (Number(o.amount) || 0); }, 0);
      confirmTotal.textContent = rows.length ? "合計 $" + total : "";
    }

    document.getElementById("confirm-back").addEventListener("click", function () {
      show("search");
    });

    confirmForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var rows = checkedRows();
      if (rows.length === 0) {
        alert("請至少勾選一筆訂單");
        return;
      }
      enterSign(rows);
    });

    // ---- sign (mirrors kiosk/sign.html) ----
    var signHeading = document.getElementById("sign-heading");
    var signRows = [];
    var pad = null;

    function enterSign(rows) {
      signRows = rows;
      signHeading.textContent = "請在下方簽名確認領取（共 " + rows.length + " 筆訂單）";
      var canvas = document.getElementById("signature-pad");
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      pad = createSignaturePad("signature-pad", "sig-clear");
      show("sign");
    }
    document.getElementById("sign-back").addEventListener("click", function () {
      show("confirm");
    });

    document.getElementById("sign-form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!pad || pad.isEmpty()) {
        alert("請先簽名再送出");
        return;
      }
      var dataUrl = pad.toDataURL();
      var now = new Date();
      var stamp = now.getFullYear() + "/" + pad2(now.getMonth() + 1) + "/" + pad2(now.getDate()) +
        " " + pad2(now.getHours()) + ":" + pad2(now.getMinutes());
      var signedMap = loadSigned();
      signRows.forEach(function (o) {
        signedMap[o.id] = {
          name: o.name,
          phone4: o.phone4,
          amount: o.amount,
          signature: dataUrl,
          signedAt: stamp,
        };
      });
      saveSigned(signedMap);
      document.getElementById("done-count").textContent = signRows.length;
      show("done");
    });

    document.getElementById("done-home").addEventListener("click", function () {
      phoneInput.value = "";
      currentGroups = null;
      currentName = null;
      show("search");
    });

    function pad2(n) { return String(n).padStart(2, "0"); }

    // ---- admin ----
    document.getElementById("admin-link").addEventListener("click", function (e) {
      e.preventDefault();
      var pin = prompt("請輸入店員密碼");
      if (pin !== ADMIN_PIN) {
        if (pin !== null) alert("密碼錯誤");
        return;
      }
      renderAdmin();
      show("admin");
    });
    document.getElementById("admin-back").addEventListener("click", function () {
      show("search");
    });

    function allGroupsWithStatus() {
      var signedMap = loadSigned();
      var groups = new Map();
      DATA.orders.forEach(function (o) {
        var gk = o.phone4 + "||" + o.name;
        if (!groups.has(gk)) groups.set(gk, { name: o.name, phone4: o.phone4, amount: 0, allSigned: true, anySigned: false, signedAt: "" });
        var g = groups.get(gk);
        g.amount += Number(o.amount) || 0;
        var rec = signedMap[o.id];
        if (rec) { g.anySigned = true; g.signedAt = rec.signedAt; }
        else { g.allSigned = false; }
      });
      return [...groups.values()].map(function (g) {
        return Object.assign(g, { allSigned: g.allSigned && g.anySigned });
      });
    }

    function renderAdmin() {
      var rows = allGroupsWithStatus();
      rows.sort(function (a, b) { return (a.allSigned === b.allSigned) ? 0 : a.allSigned ? 1 : -1; });
      var signedCount = rows.filter(function (r) { return r.allSigned; }).length;
      document.getElementById("admin-summary").textContent = "已簽收 " + signedCount + " / 共 " + rows.length + " 筆";
      document.getElementById("admin-tbody").innerHTML = rows.map(function (r) {
        var status = r.allSigned ? "已簽收 " + r.signedAt : (r.anySigned ? "部分已簽收" : "未簽收");
        var cls = r.allSigned ? "ok" : "pending";
        return "<tr><td>" + r.name + "</td><td>" + r.phone4 + "</td><td class=\"num\">$" + r.amount +
          "</td><td class=\"" + cls + "\">" + status + "</td></tr>";
      }).join("");
    }

    document.getElementById("export-csv").addEventListener("click", function () {
      var rows = allGroupsWithStatus();
      var csv = "﻿姓名,電話末4碼,金額,狀態,簽收時間\n";
      rows.forEach(function (r) {
        var status = r.allSigned ? "已簽收" : (r.anySigned ? "部分已簽收" : "未簽收");
        csv += r.name + "," + r.phone4 + "," + r.amount + "," + status + "," + (r.signedAt || "") + "\n";
      });
      downloadFile(csv, DATA.store_key + "_簽收狀態.csv", "text/csv;charset=utf-8");
    });
    document.getElementById("export-json").addEventListener("click", function () {
      downloadFile(JSON.stringify(loadSigned(), null, 2), DATA.store_key + "_簽收備份.json", "application/json");
    });
    function downloadFile(content, filename, mime) {
      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    show("search");
  }
})();
