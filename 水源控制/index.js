const DEFAULT_PHOTO = './images/default-field-photo.jpg';
let fields = [
  { name: "東區 A1 水稻田", deviceId: "WP-001-A", area: "2.5 甲", status: "灌溉中", irrigating: true, schedules: [], photo: "" },
  { name: "西區 B2 水稻田", deviceId: "WP-002-B", area: "1.8 甲", status: "灌溉中", irrigating: true, schedules: [], photo: "" },
  { name: "南區 C3 蔬菜田", deviceId: "WP-003-C", area: "8 分", status: "待灌溉", irrigating: false, schedules: [], photo: "" },
  { name: "北區 D4 果園", deviceId: "WP-004-D", area: "3.0 甲", status: "已完成", irrigating: false, schedules: [], photo: "" },
  { name: "中區 E5 玉米田", deviceId: "WP-005-E", area: "5 分", status: "待灌溉", irrigating: false, schedules: [], photo: "" }
];
let irrigationRecords = [
  { field: "東區 A1 水稻田", time: "2025-03-02 08:00", duration: "30 分鐘", status: "已完成" },
  { field: "西區 B2 水稻田", time: "2025-03-02 09:00", duration: "20 分鐘", status: "已完成" }
];
let scheduleTemplates = [
  { name: "晨間灌溉", time: "2025-03-04T06:00", duration: "30 分鐘", repeat: "每日" },
  { name: "午後長時灌溉", time: "2025-03-04T14:00", duration: "2 小時", repeat: "每週" }
];
let user = { name: "老農", password: "" };

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.navigation a, .menu a').forEach(link => link.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelector(`.navigation a[data-page="${pageId}"]`).classList.add('active');
  document.querySelector(`.menu a[data-page="${pageId}"]`).classList.add('active');
  if (pageId === 'field-management') renderFieldList();
  if (pageId === 'irrigation-records') renderRecords();
  if (pageId === 'schedule-management') renderScheduleTemplates();
  toggleMenu(false); // 切換頁面時關閉側邊欄
}

function renderFieldList() {
  const fieldCards = document.getElementById('fieldCards');
  fieldCards.innerHTML = '';
  fields.forEach((field, index) => {
    const photoUrl = field.photo && field.photo !== '' ? field.photo : DEFAULT_PHOTO;
    const card = document.createElement('div');
    card.className = 'field-card';
    card.innerHTML = `
      <div class="field-image" style="background-image: url('${photoUrl}')">
        <div class="field-status" style="background-color: ${field.irrigating ? '#4caf50' : field.status === '待灌溉' ? '#ff9800' : '#9e9e9e'}">${field.status}</div>
      </div>
      <div class="field-info">
        <h3>${field.name}</h3>
        <p>設備 ID: ${field.deviceId}</p>
        <div class="field-details">
          <span>面積: ${field.area}</span>
        </div>
      </div>
    `;
    card.onclick = () => showFieldDetail(index);
    fieldCards.appendChild(card);
  });

  const addCard = document.createElement('div');
  addCard.className = 'field-card add-field-card';
  addCard.innerHTML = `<div class="add-icon">+</div><h3>新增田區</h3><p>點這裡新增</p>`;
  addCard.onclick = () => switchPage('device-binding');
  fieldCards.appendChild(addCard);

  const irrigatingCount = fields.filter(f => f.irrigating).length;
  document.getElementById('fieldSummary').textContent = `總共有 ${fields.length} 個田區，${irrigatingCount} 個正在灌溉中`;
}

function showFieldDetail(index) {
  const field = fields[index];
  document.getElementById('fieldCards').style.display = 'none';
  document.getElementById('field-detail').style.display = 'block';
  const photoUrl = field.photo && field.photo !== '' ? field.photo : DEFAULT_PHOTO;
  document.getElementById('fieldDetailImage').style.backgroundImage = `url('${photoUrl}')`;
  document.getElementById('detailPhotoPreview').style.backgroundImage = `url('${photoUrl}')`;
  document.getElementById('fieldDetailInfo').innerHTML = `
    <h2>${field.name}</h2>
    <div class="info-item"><span>設備 ID</span><span>${field.deviceId}</span></div>
    <div class="info-item"><span>面積</span><span>${field.area}</span></div>
    <div class="info-item"><span>上次灌溉</span><span>今天 08:30</span></div>
    <div class="info-item"><span>狀態</span><span style="color: ${field.irrigating ? 'var(--accent)' : '#666'}; font-weight: bold;">${field.status}</span></div>
  `;
  const irrigateBtn = document.getElementById('irrigateNowBtn');
  irrigateBtn.textContent = field.irrigating ? '停止灌溉' : '開始灌溉';
  renderFieldSchedules(index);

  document.getElementById('detailFieldPhoto').onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const newPhotoUrl = event.target.result;
        field.photo = newPhotoUrl;
        document.getElementById('fieldDetailImage').style.backgroundImage = `url('${newPhotoUrl}')`;
        document.getElementById('detailPhotoPreview').style.backgroundImage = `url('${newPhotoUrl}')`;
        document.getElementById('detailPhotoPreview').textContent = '';
        renderFieldList();
      };
      reader.readAsDataURL(file);
    }
  };
}

function hideFieldDetail() {
  document.getElementById('fieldCards').style.display = 'grid';
  document.getElementById('field-detail').style.display = 'none';
}

function toggleIrrigation() {
  const fieldName = document.querySelector('#field-detail h2').textContent;
  const field = fields.find(f => f.name === fieldName);
  field.irrigating = !field.irrigating;
  field.status = field.irrigating ? '灌溉中' : '待灌溉';
  if (field.irrigating) {
    irrigationRecords.push({ field: field.name, time: new Date().toLocaleString(), duration: '進行中', status: '灌溉中' });
  } else {
    const lastRecord = irrigationRecords.find(r => r.field === field.name && r.duration === '進行中');
    if (lastRecord) lastRecord.duration = '30 分鐘';
  }
  showFieldDetail(fields.indexOf(field));
  renderFieldList();
}

function deleteField() {
  if (confirm('確定要刪除這個田區嗎？')) {
    const fieldName = document.querySelector('#field-detail h2').textContent;
    fields = fields.filter(f => f.name !== fieldName);
    hideFieldDetail();
    renderFieldList();
  }
}

document.getElementById('fieldPhoto').onchange = function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById('photoPreview').style.backgroundImage = `url('${event.target.result}')`;
      document.getElementById('photoPreview').textContent = '';
    };
    reader.readAsDataURL(file);
  }
};

document.getElementById('deviceBindForm').onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('bindFieldName').value;
  const deviceId = document.getElementById('bindDeviceId').value;
  const areaValue = document.getElementById('bindArea').value;
  const areaUnit = document.getElementById('bindAreaUnit').value;
  const area = `${areaValue} ${areaUnit}`;
  const photo = document.getElementById('photoPreview').style.backgroundImage.slice(5, -2) || '';
  fields.push({ name, deviceId, area, status: "待灌溉", irrigating: false, schedules: [], photo });
  this.reset();
  document.getElementById('photoPreview').style.backgroundImage = '';
  document.getElementById('photoPreview').textContent = '點擊上傳或拍照';
  switchPage('field-management');
};

function renderFieldSchedules(index) {
  const tbody = document.getElementById('scheduleTable').querySelector('tbody');
  tbody.innerHTML = '';
  fields[index].schedules.forEach((schedule, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(schedule.time).toLocaleString()}</td>
      <td>${schedule.duration}</td>
      <td>${schedule.repeat}</td>
      <td><label class="toggle-switch"><input type="checkbox" ${schedule.active ? 'checked' : ''} onchange="toggleSchedule(${index}, ${i})"><span class="slider"></span></label></td>
      <td><button class="btn btn-secondary" style="padding: 5px 8px; font-size: 0.75rem;" onclick="deleteSchedule(${index}, ${i})">刪除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('scheduleForm').onsubmit = function(e) {
  e.preventDefault();
  const fieldName = document.querySelector('#field-detail h2').textContent;
  const field = fields.find(f => f.name === fieldName);
  const durationValue = document.getElementById('scheduleDuration').value;
  const durationUnit = document.getElementById('scheduleUnit').value;
  const duration = `${durationValue} ${durationUnit}`;
  let repeat = document.getElementById('scheduleRepeat').value;
  let customDays = null;

  if (repeat === 'custom') {
    customDays = document.getElementById('scheduleCustomDays').value;
    if (!customDays || customDays < 1) {
      alert('請輸入有效的天數！');
      return;
    }
    repeat = `每 ${customDays} 天`;
  }

  const schedule = {
    time: document.getElementById('scheduleTime').value,
    duration,
    repeat,
    customDays: repeat.startsWith('每') ? parseInt(customDays) : null,
    active: true
  };
  field.schedules.push(schedule);
  document.getElementById('scheduleModal').style.display = 'none';
  this.reset();
  document.getElementById('customRepeatDays').style.display = 'none';
  showFieldDetail(fields.indexOf(field));
};

function toggleSchedule(fieldIndex, scheduleIndex) {
  fields[fieldIndex].schedules[scheduleIndex].active = !fields[fieldIndex].schedules[scheduleIndex].active;
  renderFieldSchedules(fieldIndex);
}

function deleteSchedule(fieldIndex, scheduleIndex) {
  if (confirm('確定要刪除這個排程嗎？')) {
    fields[fieldIndex].schedules.splice(scheduleIndex, 1);
    renderFieldSchedules(fieldIndex);
  }
}

function renderScheduleTemplates() {
  const tbody = document.getElementById('templateTable').querySelector('tbody');
  tbody.innerHTML = '';
  scheduleTemplates.forEach((template, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${template.name}</td>
      <td>${new Date(template.time).toLocaleString()}</td>
      <td>${template.duration}</td>
      <td>${template.repeat}</td>
      <td>
        <div class="control-buttons" style="gap: 5px;">
          <button class="btn btn-primary" onclick="showApplyTemplateModal(${index})">套用</button>
          <button class="btn btn-danger" onclick="deleteTemplate(${index})">刪除</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('templateForm').onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('templateName').value;
  const time = document.getElementById('templateTime').value;
  const durationValue = document.getElementById('templateDuration').value;
  const durationUnit = document.getElementById('templateUnit').value;
  const duration = `${durationValue} ${durationUnit}`;
  let repeat = document.getElementById('templateRepeat').value;
  let customDays = null;

  if (repeat === 'custom') {
    customDays = document.getElementById('templateCustomDays').value;
    if (!customDays || customDays < 1) {
      alert('請輸入有效的天數！');
      return;
    }
    repeat = `每 ${customDays} 天`;
  }

  scheduleTemplates.push({ name, time, duration, repeat, customDays: repeat.startsWith('每') ? parseInt(customDays) : null });
  document.getElementById('addTemplateModal').style.display = 'none';
  this.reset();
  document.getElementById('customTemplateDays').style.display = 'none';
  renderScheduleTemplates();
};

function deleteTemplate(index) {
  if (confirm('確定要刪除這個排程模板嗎？')) {
    scheduleTemplates.splice(index, 1);
    renderScheduleTemplates();
  }
}

function showApplyTemplateModal(templateIndex) {
  const checkboxGroup = document.getElementById('templateFieldCheckboxes');
  checkboxGroup.innerHTML = '';
  fields.forEach(field => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" name="applyTemplateField" value="${field.name}">
      ${field.name}
    `;
    checkboxGroup.appendChild(label);
  });

  document.getElementById('applyTemplateForm').onsubmit = function(e) {
    e.preventDefault();
    const selectedFields = Array.from(document.querySelectorAll('input[name="applyTemplateField"]:checked')).map(input => input.value);
    
    if (selectedFields.length === 0) {
      alert('請至少選擇一個田區！');
      return;
    }

    const template = scheduleTemplates[templateIndex];
    fields.forEach(field => {
      if (selectedFields.includes(field.name)) {
        field.schedules.push({ ...template, active: true });
      }
    });

    document.getElementById('applyTemplateModal').style.display = 'none';
    alert('已將排程模板套用到選定的田區！');
    renderFieldList();
  };

  document.getElementById('applyTemplateModal').style.display = 'flex';
}

function renderRecords() {
  const tbody = document.getElementById('recordTable').querySelector('tbody');
  tbody.innerHTML = '';
  irrigationRecords.forEach(record => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${record.field}</td><td>${record.time}</td><td>${record.duration}</td><td>${record.status}</td>`;
    tbody.appendChild(tr);
  });
}

function toggleCustomRepeat(selectElement, customDivId) {
  const customDiv = document.getElementById(customDivId);
  customDiv.style.display = selectElement.value === 'custom' ? 'block' : 'none';
}

function toggleMenu(forceClose = false) {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('overlay');
  const isActive = sidebar.classList.contains('active');

  if (forceClose || isActive) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  } else {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  }
}

function showUserEditModal() {
  document.getElementById('editUserName').value = user.name;
  document.getElementById('editPassword').value = '';
  document.getElementById('userEditModal').style.display = 'flex';
  toggleMenu(false); // 關閉側邊欄
}

document.getElementById('userEditForm').onsubmit = function(e) {
  e.preventDefault();
  const newName = document.getElementById('editUserName').value;
  const newPassword = document.getElementById('editPassword').value;
  if (newName) {
    user.name = newName;
    document.getElementById('userName').textContent = newName;
    document.getElementById('userAvatar').textContent = newName[0];
  }
  if (newPassword) {
    user.password = newPassword;
  }
  document.getElementById('userEditModal').style.display = 'none';
  alert('用戶資訊已更新！');
};

document.querySelectorAll('.navigation a, .menu a').forEach(link => {
  link.onclick = (e) => {
    e.preventDefault();
    switchPage(link.getAttribute('data-page'));
  };
});

renderFieldList();