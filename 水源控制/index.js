const DEFAULT_PHOTO = './images/default-field-photo.jpg';
let fields = [];
let scheduleTemplates = [];
let irrigationRecords = [];
let user = { name: "老農" };

// 當頁面載入時執行
document.addEventListener("DOMContentLoaded", function() {
  const now = new Date();
  const formattedDateTime = now.toISOString().slice(0, 16);
  document.getElementById("templateTime").value = formattedDateTime;
});

async function checkLoginStatus() {
  try {
    const response = await fetch(`${config.baseURL}/php/username.php`, {
      method: 'GET',
      credentials: 'same-origin'
    });
    const data = await response.json();
    if (!data.name || data.status === 'error') {
      alert('請先登入');
      window.location.href = `${config.baseURL}/login.html`;
      return false;
    }
    return true;
  } catch (err) {
    console.error('檢查登入狀態錯誤:', err);
    alert('請先登入');
    window.location.href = `${config.baseURL}/login.html`;
    return false;
  }
}

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.navigation a, .menu a').forEach(link => link.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelector(`.navigation a[data-page="${pageId}"]`).classList.add('active');
  document.querySelector(`.menu a[data-page="${pageId}"]`).classList.add('active');
  if (pageId === 'field-management') renderFieldList();
  if (pageId === 'irrigation-records') loadIrrigationRecords();
  if (pageId === 'schedule-management') renderScheduleTemplates();
  toggleMenu(true);
}

function renderFieldList(searchTerm = '') {
  const fieldCards = document.getElementById('fieldCards');
  fieldCards.innerHTML = '';

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    field.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filteredFields.forEach((field, index) => {
    const photoUrl = field.photo && field.photo !== '' ? field.photo : DEFAULT_PHOTO;
    const card = document.createElement('div');
    card.className = 'field-card';
    card.innerHTML = `
      <div class="field-image" style="background-image: url('${photoUrl}')">
        <div class="field-status" style="background-color: ${field.irrigating ? '#4caf50' : (field.status === '待灌溉' ? '#ff9800' : '#9e9e9e')}">
          ${field.irrigating ? '灌溉中' : field.status || '待灌溉'}
        </div>
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

  const irrigatingCount = filteredFields.filter(f => f.irrigating).length;
  document.getElementById('fieldSummary').textContent = `總共有 ${filteredFields.length} 個田區，${irrigatingCount} 個正在灌溉中`;
}

async function getDeviceStatus(deviceId) {
  try {
    const response = await fetch(`${config.baseURL}/php/get_device_status.php?deviceId=${deviceId}`, {
      method: 'GET',
      credentials: 'same-origin'
    });
    if (!response.ok) throw new Error(`HTTP 錯誤: ${response.status}`);
    const data = await response.json();
    if (data.status === 'success') {
      return data.irrigating;
    } else {
      console.warn('無法獲取設備狀態:', data.message);
      alert('無法獲取設備狀態,請檢察設備號是否有誤或連繫維護蓋亞營運軟體有限公司:', data.message);
      return null;
    }
  } catch (err) {
    console.error('獲取設備狀態錯誤:', err);
    return null;
  }
}

async function showFieldDetail(index) {
  const field = fields[index];
  document.getElementById('fieldCards').style.display = 'none';
  document.getElementById('field-detail').style.display = 'block';
  
  const actualIrrigating = await getDeviceStatus(field.deviceId);
  if (actualIrrigating !== null) {
    field.irrigating = actualIrrigating;
  }

  const photoUrl = field.photo && field.photo !== '' ? field.photo : DEFAULT_PHOTO;
  document.getElementById('fieldDetailImage').style.backgroundImage = `url('${photoUrl}')`;
  document.getElementById('detailPhotoPreview').style.backgroundImage = `url('${photoUrl}')`;
  document.getElementById('detailPhotoPreview').textContent = field.photo ? '' : '更換照片';
  document.getElementById('fieldDetailInfo').innerHTML = `
    <h2>${field.name}</h2>
    <div class="info-item"><span>設備 ID</span><span>${field.deviceId}</span></div>
    <div class="info-item"><span>面積</span><span>${field.area}</span></div>
    <div class="info-item"><span>上次灌溉</span><span>${field.lastIrrigation || '無紀錄'}</span></div>
    <div class="info-item"><span>狀態</span><span style="color: ${field.irrigating ? '#4caf50' : '#666'}; font-weight: bold;">${field.irrigating ? '灌溉中' : field.status}</span></div>
  `;
  
  const irrigateBtn = document.getElementById('irrigateNowBtn');
  irrigateBtn.textContent = field.irrigating ? '結束灌溉' : '開始灌溉';
  irrigateBtn.className = `btn ${field.irrigating ? 'btn-danger' : 'btn-primary'}`;
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
        renderFieldList(document.getElementById('fieldSearch').value);
      };
      reader.readAsDataURL(file);
    }
  };
}

function showEditFieldForm() {
  const fieldName = document.querySelector('#field-detail h2').textContent;
  const field = fields.find(f => f.name === fieldName);
  document.getElementById('editFieldName').value = field.name;
  document.getElementById('editDeviceId').value = field.deviceId;
  const [areaValue, areaUnit] = field.area.split(' ');
  document.getElementById('editAreaValue').value = areaValue;
  document.getElementById('editAreaUnit').value = areaUnit;
  const photoUrl = field.photo && field.photo !== '' ? field.photo : DEFAULT_PHOTO;
  document.getElementById('editPhotoPreview').style.backgroundImage = `url('${photoUrl}')`;
  document.getElementById('editPhotoPreview').textContent = field.photo ? '' : '點擊上傳或拍照';
  document.getElementById('editFieldModal').style.display = 'flex';

  document.getElementById('editFieldPhoto').onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('editPhotoPreview').style.backgroundImage = `url('${event.target.result}')`;
        document.getElementById('editPhotoPreview').textContent = '';
      };
      reader.readAsDataURL(file);
    }
  };
}

document.getElementById('editFieldForm').onsubmit = function(e) {
  e.preventDefault();
  const originalFieldName = document.querySelector('#field-detail h2').textContent;
  const field = fields.find(f => f.name === originalFieldName);
  const fieldName = document.getElementById('editFieldName').value;
  const deviceId = document.getElementById('editDeviceId').value;
  const areaValue = document.getElementById('editAreaValue').value;
  const areaUnit = document.getElementById('editAreaUnit').value;
  const area = `${areaValue} ${areaUnit}`;
  const photoInput = document.getElementById('editFieldPhoto').files[0];

  if (!fieldName || !deviceId || !areaValue) {
    alert('請填寫所有必填欄位！');
    return;
  }

  const formData = new FormData();
  formData.append('originalDeviceId', field.deviceId);
  formData.append('fieldName', fieldName);
  formData.append('deviceId', deviceId);
  formData.append('area', area);
  if (photoInput) formData.append('fieldPhoto', photoInput);

  fetch(`${config.baseURL}/php/update_field.php`, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('田區更新成功！');
      field.name = fieldName;
      field.deviceId = deviceId;
      field.area = area;
      if (photoInput) {
        const reader = new FileReader();
        reader.onload = function(event) {
          field.photo = event.target.result;
          showFieldDetail(fields.indexOf(field));
        };
        reader.readAsDataURL(photoInput);
      } else {
        showFieldDetail(fields.indexOf(field));
      }
      renderFieldList(document.getElementById('fieldSearch').value);
      document.getElementById('editFieldModal').style.display = 'none';
    } else {
      alert('更新失敗：' + data.message);
    }
  })
  .catch(err => {
    console.error('更新錯誤：', err);
    alert('更新田區時發生錯誤，請稍後再試');
  });
};

function hideFieldDetail() {
  document.getElementById('fieldCards').style.display = 'grid';
  document.getElementById('field-detail').style.display = 'none';
}

async function toggleIrrigation() {
  const fieldName = document.querySelector('#field-detail h2').textContent;
  const field = fields.find(f => f.name === fieldName);
  const action = field.irrigating ? 'stop' : 'start';
  if (confirm(`確定要${action === 'start' ? '開始' : '停止'}灌溉 "${fieldName}" 嗎？`)) {
    try {
      const formData = new FormData();
      formData.append('deviceId', field.deviceId);
      formData.append('command', action);

      const response = await fetch(`${config.baseURL}/php/controlSensor.php`, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });

      if (!response.ok) throw new Error(`HTTP 錯誤: ${response.status}`);
      const data = await response.json();

      if (data.status === 'success') {
        const actualIrrigating = await getDeviceStatus(field.deviceId);
        field.irrigating = actualIrrigating !== null ? actualIrrigating : (action === 'start');

        const getTaipeiTime = () => {
          const now = new Date();
          return new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).formatToParts(now).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
          }, {});
        };

        if (action === 'start') {
          field.status = '灌溉中';
          const start = getTaipeiTime();
          field.startTime = `${start.year}-${start.month}-${start.day}T${start.hour}:${start.minute}:${start.second}+08:00`;
          alert('開始灌溉成功');
        } else {
          field.status = '已完成';
          const end = getTaipeiTime();
          const endTime = `${end.year}-${end.month}-${end.day}T${end.hour}:${end.minute}:${end.second}+08:00`;

          if (!field.startTime || isNaN(new Date(field.startTime))) {
            field.startTime = endTime;
          }

          const duration = calculateDuration(field.startTime, endTime);
          field.lastIrrigation = new Date(field.startTime).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

          const recordData = {
            field: fieldName,
            time: field.startTime,
            duration: duration,
            status: '已完成'
          };

          const recordResponse = await fetch(`${config.baseURL}/php/add_irrigation_record.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordData),
            credentials: 'same-origin'
          });

          const recordResult = await recordResponse.json();
          if (recordResult.status === 'success') {
            loadIrrigationRecords();
          } else {
            throw new Error(recordResult.message || '灌溉紀錄新增失敗');
          }

          delete field.startTime;
          alert('停止灌溉成功');
        }
        showFieldDetail(fields.indexOf(field));
        renderFieldList(document.getElementById('fieldSearch').value);
      } else {
        throw new Error(data.message || '控制設備失敗');
      }
    } catch (error) {
      console.error('控制錯誤:', error);
      alert(`操作失敗，請洽維護廠商 蓋亞營運軟體有限公司: ${error.message}`);
    }
  }
}

function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start) || isNaN(end)) {
    console.error('無效的時間參數:', { startTime, endTime });
    return '1 分鐘';
  }
  const diffMs = end - start;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds} 秒`;
  else if (seconds < 3600) return `${Math.round(seconds / 60)} 分鐘`;
  else return `${Math.round(seconds / 3600)} 小時`;
}

function deleteField() {
  const fieldName = document.querySelector('#field-detail h2').textContent;
  const field = fields.find(f => f.name === fieldName);
  if (confirm(`確定要刪除田區 "${fieldName}" 嗎？此操作無法復原！`)) {
    fetch(`${config.baseURL}/php/delete_field.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: field.deviceId }),
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('田區刪除成功！');
        hideFieldDetail();
        loadFields();
      } else {
        alert('刪除失敗：' + data.message);
      }
    })
    .catch(err => {
      console.error('刪除錯誤：', err);
      alert('刪除田區時發生錯誤，請稍後再試');
    });
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

document.getElementById('deviceBindForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fieldName = document.getElementById('bindFieldName').value;
  const deviceId = document.getElementById('bindDeviceId').value;
  const areaValue = document.getElementById('bindArea').value;
  const areaUnit = document.getElementById('bindAreaUnit').value;
  const area = `${areaValue} ${areaUnit}`;
  const photoInput = document.getElementById('fieldPhoto').files[0];

  if (!fieldName || !deviceId || !areaValue) {
    alert('請填寫所有必填欄位！');
    return;
  }

  const formData = new FormData();
  formData.append('fieldName', fieldName);
  formData.append('deviceId', deviceId);
  formData.append('area', area);
  if (photoInput) formData.append('fieldPhoto', photoInput);

  fetch(`${config.baseURL}/php/add_field.php`, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('田區新增成功！');
      this.reset();
      document.getElementById('photoPreview').style.backgroundImage = '';
      document.getElementById('photoPreview').textContent = '點擊上傳或拍照';
      loadFields();
      switchPage('field-management');
    } else {
      alert('新增失敗：' + data.message);
    }
  })
  .catch(err => {
    console.error('新增錯誤：', err);
    alert('新增田區時發生錯誤，請稍後再試');
  });
});

function renderFieldSchedules(index) {
  const tbody = document.getElementById('scheduleTable').querySelector('tbody');
  tbody.innerHTML = '';
  if (!fields[index].schedules || !Array.isArray(fields[index].schedules)) {
    fields[index].schedules = [];
  }
  fields[index].schedules.forEach((schedule, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(schedule.time).toLocaleString()}</td>
      <td>${schedule.duration}</td>
      <td>${schedule.repeat}</td>
      <td><label class="toggle-switch"><input type="checkbox" ${schedule.active ? 'checked' : ''} onchange="toggleSchedule(${index}, ${i})"><span class="slider"></span></label></td>
      <td><button class="btn btn-danger" style="padding: 5px 8px; font-size: 0.75rem;" onclick="deleteSchedule(${index}, ${i})">刪除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('scheduleForm').onsubmit = async function(e) {
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

  try {
    const formData = new FormData();
    formData.append('deviceId', field.deviceId);
    formData.append('time', schedule.time);
    formData.append('duration', schedule.duration);
    formData.append('repeat', schedule.repeat);
    formData.append('active', schedule.active ? 1 : 0);

    const response = await fetch(`${config.baseURL}/php/add_schedule.php`, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });
    const data = await response.json();

    if (data.status === 'success') {
      schedule.id = data.scheduleId;
      field.schedules.push(schedule);
      document.getElementById('scheduleModal').style.display = 'none';
      this.reset();
      document.getElementById('customRepeatDays').style.display = 'none';
      showFieldDetail(fields.indexOf(field));
    } else {
      alert('新增排程失敗：' + data.message);
    }
  } catch (err) {
    console.error('新增排程錯誤：', err);
    alert('新增排程時發生錯誤，請稍後再試');
  }
};

async function toggleSchedule(fieldIndex, scheduleIndex) {
  const schedule = fields[fieldIndex].schedules[scheduleIndex];
  const originalActive = schedule.active;
  schedule.active = !schedule.active;

  try {
    const formData = new FormData();
    formData.append('deviceId', fields[fieldIndex].deviceId);
    formData.append('scheduleId', schedule.id || scheduleIndex);
    formData.append('active', schedule.active ? 1 : 0);

    const response = await fetch(`${config.baseURL}/php/update_schedule.php`, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });
    const data = await response.json();

    if (data.status === 'success') {
      renderFieldSchedules(fieldIndex);
    } else {
      schedule.active = originalActive;
      alert('開關失敗，請洽維護廠商 蓋亞營運軟體有限公司：' + data.message);
    }
  } catch (err) {
    schedule.active = originalActive;
    console.error('更新排程錯誤：', err);
    alert('開關失敗，請洽維護廠商 蓋亞營運軟體有限公司');
  }
}

async function deleteSchedule(fieldIndex, scheduleIndex) {
  if (confirm('確定要刪除這個排程嗎？此操作無法復原！')) {
    const schedule = fields[fieldIndex].schedules[scheduleIndex];
    try {
      const formData = new FormData();
      formData.append('deviceId', fields[fieldIndex].deviceId);
      formData.append('scheduleId', schedule.id || scheduleIndex);

      const response = await fetch(`${config.baseURL}/php/delete_schedule.php`, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      const data = await response.json();

      if (data.status === 'success') {
        fields[fieldIndex].schedules.splice(scheduleIndex, 1);
        renderFieldSchedules(fieldIndex);
      } else {
        alert('刪除排程失敗：' + data.message);
      }
    } catch (err) {
      console.error('刪除排程錯誤：', err);
      alert('刪除排程時發生錯誤');
    }
  }
}

function renderScheduleTemplates() {
  const tbody = document.getElementById('templateTable').querySelector('tbody');
  tbody.innerHTML = '';
  fetch(`${config.baseURL}/php/get_schedule_templates.php`, {
    method: 'GET',
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      scheduleTemplates = data.templates;
      scheduleTemplates.forEach((template) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${template.name}</td>
          <td>${new Date(template.time).toLocaleString()}</td>
          <td>${template.duration}</td>
          <td>${template.repeat_interval}</td>
          <td>
            <div class="control-buttons" style="gap: 5px;">
              <button class="btn btn-primary" onclick="showApplyTemplateModal(${template.id})">套用</button>
              <button class="btn btn-danger" onclick="deleteTemplate(${template.id})">刪除</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      alert('讀取排程模板失敗: ' + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert('讀取排程模板錯誤');
  });
}

document.getElementById('templateForm').onsubmit = function(e) {
  e.preventDefault();
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

  const formData = new FormData();
  formData.append('templateName', document.getElementById('templateName').value);
  formData.append('templateTime', document.getElementById('templateTime').value);
  formData.append('templateDuration', duration);
  formData.append('templateRepeat', repeat);
  if (customDays) formData.append('templateCustomDays', customDays);

  fetch(`${config.baseURL}/php/add_schedule_template.php`, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('模板新增成功');
      document.getElementById('addTemplateModal').style.display = 'none';
      document.getElementById('templateForm').reset();
      document.getElementById('customTemplateDays').style.display = 'none';
      renderScheduleTemplates();
    } else {
      alert('新增失敗: ' + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert('新增模板錯誤');
  });
};

function deleteTemplate(id) {
  if (confirm(`確定要刪除排程模板嗎？此操作無法復原！`)) {
    const formData = new FormData();
    formData.append('templateId', id);
    fetch(`${config.baseURL}/php/delete_schedule_template.php`, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('模板刪除成功');
        renderScheduleTemplates();
      } else {
        alert('刪除失敗: ' + data.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert('刪除模板錯誤');
    });
  }
}

async function showApplyTemplateModal(templateId) {
const template = scheduleTemplates.find(t => t.id == templateId);
if (!template) {
alert('找不到該模板');
return;
}
const checkboxGroup = document.getElementById('templateFieldCheckboxes');
if (!checkboxGroup) {
console.error('找不到 templateFieldCheckboxes 元素');
return;
}
checkboxGroup.innerHTML = '';
console.log('可用田區:', fields);
if (fields.length === 0) {
checkboxGroup.innerHTML = '<p>目前沒有可用的田區</p>';
} else {
fields.forEach(field => {
  const isTemplateApplied = field.schedules && field.schedules.some(s => 
    s.id === template.id || 
    (s.time === template.time && 
     s.duration === template.duration && 
     s.repeat === template.repeat_interval)
  );
  const label = document.createElement('label');
  label.innerHTML = `
    <input type="checkbox" name="applyTemplateField" value="${field.deviceId}" ${isTemplateApplied ? 'disabled' : ''}>
    ${field.name} ${isTemplateApplied ? '(已套用此模板)' : ''}
  `;
  checkboxGroup.appendChild(label);
});
}

document.getElementById('applyTemplateModal').style.display = 'flex';

document.getElementById('applyTemplateForm').onsubmit = async function(e) {
e.preventDefault();
const selectedDeviceIds = Array.from(document.querySelectorAll('input[name="applyTemplateField"]:checked')).map(input => input.value);

if (selectedDeviceIds.length === 0) {
  alert('請至少選擇一個田區！');
  return;
}

try {
  const formData = new FormData();
  formData.append('templateId', templateId);
  formData.append('deviceIds', JSON.stringify(selectedDeviceIds));

  const response = await fetch(`${config.baseURL}/php/apply_schedule_template.php`, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  });
  const data = await response.json();

  if (data.status === 'success') {
    fields.forEach(field => {
      if (selectedDeviceIds.includes(field.deviceId)) {
        // 確保不重複添加相同的排程
        const isDuplicate = field.schedules.some(s => 
          s.id === template.id || 
          (s.time === template.time && 
           s.duration === template.duration && 
           s.repeat === template.repeat_interval)
        );
        if (!isDuplicate) {
          field.schedules.push({
            time: template.time,
            duration: template.duration,
            repeat: template.repeat_interval,
            active: true,
            id: data.schedules[field.deviceId] ? data.schedules[field.deviceId].id : null
          });
        }
      }
    });
    document.getElementById('applyTemplateModal').style.display = 'none';
    alert('已將排程模板套用到選定的田區！');
    renderFieldList(document.getElementById('fieldSearch').value);
  } else {
    alert('套用模板失敗：' + data.message);
  }
} catch (err) {
  console.error('套用模板錯誤：', err);
  alert('套用模板時發生錯誤');
}
};
}

function loadIrrigationRecords() {
  fetch(`${config.baseURL}/php/get_irrigation_records.php`, {
    method: 'GET',
    credentials: 'same-origin'
  })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP 錯誤: ${response.status}`);
    return response.json();
  })
  .then(data => {
    if (data.status === 'success') {
      irrigationRecords = data.records;
      renderRecords();
    } else {
      console.error('載入灌溉紀錄失敗：', data.message);
    }
  })
  .catch(err => console.error('錯誤：', err));
}

function renderRecords() {
  const tbody = document.getElementById('recordTable').querySelector('tbody');
  tbody.innerHTML = '';
  irrigationRecords.forEach(record => {
    const timeStr = record.time && record.time !== '' 
      ? new Date(record.time).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }) 
      : '無紀錄';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${record.field_name || '未知田區'}</td>
      <td>${timeStr}</td>
      <td>${record.duration}</td>
      <td>${record.status}</td>
    `;
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
  document.getElementById('userEditModal').style.display = 'flex';
  toggleMenu(false);
}

document.getElementById('userEditForm').onsubmit = function(e) {
  e.preventDefault();
  const newName = document.getElementById('editUserName').value;

  if (!newName) {
    alert('請輸入新名稱');
    return;
  }

  const formData = new FormData();
  formData.append('newName', newName);

  fetch(`${config.baseURL}/php/update_user.php`, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('使用者名稱更新成功！');
      user.name = newName;
      document.getElementById('userName').textContent = newName;
      document.getElementById('userAvatar').textContent = newName.charAt(0);
    } else {
      alert('更新失敗：' + data.message);
    }
  })
  .catch(err => console.error('更新錯誤：', err));

  document.getElementById('userEditModal').style.display = 'none';
};

document.querySelectorAll('.navigation a, .menu a').forEach(link => {
  link.onclick = (e) => {
    e.preventDefault();
    switchPage(link.getAttribute('data-page'));
  };
});

document.getElementById('fieldSearch').addEventListener('input', function(e) {
  renderFieldList(e.target.value);
});

function loadUserInfo() {
  fetch(`${config.baseURL}/php/username.php`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP 錯誤: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (data.name) {
        user.name = data.name;
        document.getElementById('userName').textContent = data.name;
        document.getElementById('userAvatar').textContent = data.name.charAt(0);
      } else {
        console.warn('沒有取得使用者名稱');
      }
    })
    .catch(error => console.error('取得使用者資訊失敗:', error));
}

async function loadFields() {
  try {
    const response = await fetch(`${config.baseURL}/php/get_field.php`, {
      method: 'GET',
      credentials: 'same-origin'
    });
    if (!response.ok) throw new Error(`HTTP 錯誤: ${response.status}`);
    const data = await response.json();
    if (data.status === 'success') {
      fields = data.fields.map(field => ({
        name: field.field_name,
        deviceId: field.device_id,
        area: `${field.area_value} ${field.area_unit}`,
        status: field.status || '待灌溉',
        irrigating: field.irrigating || false,
        schedules: field.schedules.map(s => ({
          id: s.id,
          time: s.time,
          duration: s.duration,
          repeat: s.repeat_interval,
          active: s.active
        })),
        photo: field.photo || '',
        lastIrrigation: field.last_irrigation || ''
      }));
      renderFieldList();
    } else {
      console.error('載入田區失敗：', data.message);
    }
  } catch (err) {
    console.error('loadFields 錯誤:', err);
  }
}

function logout() {
  if (confirm('確定要登出嗎？')) {
    localStorage.removeItem('authToken');
    window.location.href = `${config.baseURL}/php/logout.php`;
  }
}

async function initialize() {
  const isLoggedIn = await checkLoginStatus();
  if (isLoggedIn) {
    loadUserInfo();
    loadFields();
    loadIrrigationRecords();
  }
}
initialize();