
        /********************
     * 全域變數與查詢表 (模擬後台資料)
     ********************/
    // 模擬農民與田地的對應面積（單位：甲）
    const areaLookup = {
        "李農": { "地點A": 5, "地點B": 6, "未知": 4 },
        "陳農": { "地點A": 7, "地點B": 8, "未知": 6 },
        "大農": { "地點A": 9, "地點B": 10, "未知": 8 }
      };
    
    function formatDate(date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    /********************
     * 桌機日曆功能 (Desktop)
     ********************/
    let currentMonth = new Date(2025, 0); // 從 2025 年 1 月開始
    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    let dailyLimit = 10; // 每日排程上限 (甲)

    // 假資料：包含日期、農民名稱、田地、面積 與 備註
    const schedules = [
      { date: '2025-02-05', farmer: '李農', farm: '地點A', area: areaLookup["李農"]["地點A"], notes: '備註1' },
      { date: '2025-02-05', farmer: '李農', farm: '地點B', area: areaLookup["李農"]["地點B"], notes: '備註1' },
      { date: '2025-02-05', farmer: '李農', farm: '未知', area: areaLookup["李農"]["未知"], notes: '備註1' },
      { date: '2025-02-10', farmer: '陳農', farm: '地點A', area: areaLookup["陳農"]["地點A"], notes: '備註2' },
      { date: '2025-02-10', farmer: '陳農', farm: '地點B', area: areaLookup["陳農"]["地點B"], notes: '備註2' },
      { date: '2025-02-15', farmer: '大農', farm: '地點A', area: areaLookup["大農"]["地點A"], notes: '備註3' },
      { date: '2025-02-20', farmer: '大農', farm: '地點B', area: areaLookup["大農"]["地點B"], notes: '備註4' }
    ];

    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
      const toggleButtons = document.querySelectorAll('.sidebar-toggle');
      if (sidebar.classList.contains('open')) {
        toggleButtons.forEach(btn => { btn.style.display = 'none'; });
      } else {
        toggleButtons.forEach(btn => { btn.style.display = 'block'; });
      }
    }

    function changeMonth(offset) {
      currentMonth.setMonth(currentMonth.getMonth() + offset);
      renderCalendar();
    }

    function renderCalendar() {
      const calendar = document.getElementById('calendar');
      const monthTitle = document.getElementById('monthTitle');
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      monthTitle.textContent = `${year}年 ${monthNames[month]}`;

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayOfWeek = firstDay.getDay();
      calendar.innerHTML = '';

      // 補齊前面空格
      for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'border-b', 'border-r', 'p-2', 'bg-gray-50');
        calendar.appendChild(emptyCell);
      }

      // 填充日期
      for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day', 'border-b', 'border-r', 'p-2');
        dayCell.innerHTML = `<div class="text-center font-medium">${day}</div>`;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const scheduledItems = schedules.filter(schedule => schedule.date === dateStr);
        let totalArea = 0;
        const maxVisible = 4;
        scheduledItems.forEach((schedule, index) => {
          if (index < maxVisible) {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.classList.add('schedule-item');
            scheduleDiv.textContent = `${schedule.farmer} (${schedule.area}甲) - ${schedule.notes}`;
            dayCell.appendChild(scheduleDiv);
          }
          totalArea += schedule.area;
        });
        if (totalArea >= dailyLimit) {
          const warningDiv = document.createElement('div');
          warningDiv.classList.add('schedule-item', 'over-limit');
          warningDiv.textContent = `當日排程已達上限 (最多 ${dailyLimit} 甲)`;
          dayCell.appendChild(warningDiv);
        }
        dayCell.addEventListener('click', () => showDailySchedule(dateStr));
        calendar.appendChild(dayCell);
      }
    }

    function showDailySchedule(dateStr) {
      const scheduledItems = schedules.filter(schedule => schedule.date === dateStr);
      const dailyScheduleTitle = document.getElementById('dailyScheduleTitle');
      const dailyScheduleContent = document.getElementById('dailyScheduleContent');
      dailyScheduleTitle.textContent = `日期: ${dateStr}`;
      dailyScheduleContent.innerHTML = '';
      if (scheduledItems.length === 0) {
        dailyScheduleContent.innerHTML = '<p>當日無排程</p>';
      } else {
        scheduledItems.forEach(schedule => {
          const scheduleDiv = document.createElement('div');
          scheduleDiv.classList.add('schedule-item');
          scheduleDiv.textContent = `${schedule.farmer} (${schedule.area}甲) - ${schedule.notes}`;
          dailyScheduleContent.appendChild(scheduleDiv);
        });
      }
      document.getElementById('dailyScheduleModal').classList.remove('hidden');
    }

    function hideDailySchedule() {
      document.getElementById('dailyScheduleModal').classList.add('hidden');
    }

    function showAddSchedule() {
      document.getElementById('addScheduleModal').classList.remove('hidden');
    }

    function hideAddSchedule() {
      document.getElementById('addScheduleModal').classList.add('hidden');
    }

    // 新增排程：只驗證日期與農民名稱與田地，面積由 areaLookup 決定
    function addSchedule() {
      const date = document.getElementById('scheduleDate').value;
      const farmer = document.getElementById('farmer_name').value;
      const farm = document.getElementById('farm').value;
      const notes = document.getElementById('notes').value;
      
      if (!date || !farmer || !farm) {
        alert('請填寫日期、農民名稱與選擇地塊（備註為選填）');
        return;
      }
      
      // 由 lookup 取得面積
      const area = areaLookup[farmer] && areaLookup[farmer][farm] ? areaLookup[farmer][farm] : 0;
      
      const daySchedules = schedules.filter(schedule => schedule.date === date);
      const totalArea = daySchedules.reduce((total, schedule) => total + schedule.area, 0);
      if (totalArea + area > dailyLimit) {
        alert(`當日排程已達上限，每天最多只能排 ${dailyLimit} 甲`);
        return;
      }
      
      schedules.push({ date, farmer, farm, area, notes });
      renderCalendar();
      hideAddSchedule();
    }

    function updateDailyLimit() {
      dailyLimit = parseFloat(document.getElementById('dailyLimit').value);
      renderCalendar();
      document.getElementById('mobileDailyLimit').value = dailyLimit;
      renderMobileCard(mobileCurrentDate);
    }

    function updateDailyLimitMobile() {
      dailyLimit = parseFloat(document.getElementById('mobileDailyLimit').value);
      renderCalendar();
      renderMobileCard(mobileCurrentDate);
    }

    /********************
     * 手機大卡片功能 (明顯滑動效果)
     ********************/
    let mobileCurrentDate = new Date();
    let isSliding = false;

    function createMobileCardElement(date) {
      const dateStr = formatDate(date);
      const card = document.createElement('div');
      card.id = 'mobileCard';
      card.className = "min-h-[300px] bg-gradient-to-r from-blue-200 to-blue-400 rounded-2xl p-6 flex flex-col justify-center items-center";
      card.style.position = "absolute";
      card.style.top = "0";
      card.style.left = "0";
      card.style.width = "100%";
      card.style.transition = "transform 0.7s ease-in-out";
      let html = `<h2 class="text-3xl font-bold mb-4">${dateStr}</h2>`;
      const daySchedules = schedules.filter(s => s.date === dateStr);
      let totalArea = 0;
      if (daySchedules.length === 0) {
        html += `<p class="text-xl text-gray-700">當日無排程</p>`;
      } else {
        daySchedules.forEach(s => {
          html += `<div class="bg-white rounded-lg p-4 mb-4 w-full shadow">
                    <p class="text-2xl font-semibold">${s.farmer}</p>
                    <p class="mt-2 text-lg">面積：${s.area} 甲</p>
                    <p class="mt-2 text-lg">備註：${s.notes}</p>
                  </div>`;
          totalArea += s.area;
        });
      }
      if (totalArea >= dailyLimit) {
        html += `<div class="bg-red-100 text-red-700 rounded p-2 mt-2">當日排程已達上限 (最多 ${dailyLimit} 甲)</div>`;
      }
      card.innerHTML = html;
      return card;
    }

    function renderMobileCard(date) {
      const container = document.getElementById('mobileCardContainer');
      container.innerHTML = "";
      const card = createMobileCardElement(date);
      card.style.transform = "translateX(0)";
      container.appendChild(card);
      document.getElementById('mobileDate').value = formatDate(date);
    }

    function slideMobileCard(direction) {
      if (isSliding) return;
      isSliding = true;
      
      const container = document.getElementById('mobileCardContainer');
      const currentCard = document.getElementById('mobileCard');
      const newDate = new Date(mobileCurrentDate);
      if (direction === 'left') {
        newDate.setDate(newDate.getDate() + 1);
      } else if (direction === 'right') {
        newDate.setDate(newDate.getDate() - 1);
      }
      const newCard = createMobileCardElement(newDate);
      newCard.style.transform = (direction === 'left') ? "translateX(150%)" : "translateX(-150%)";
      container.appendChild(newCard);
      newCard.offsetWidth;
      currentCard.style.transform = (direction === 'left') ? "translateX(-150%)" : "translateX(150%)";
      newCard.style.transform = "translateX(0)";
      
      newCard.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== "transform") return;
        newCard.removeEventListener('transitionend', handler);
        container.removeChild(currentCard);
        mobileCurrentDate = newDate;
        isSliding = false;
      });
    }

    function onMobileDateChange() {
      const newDate = new Date(document.getElementById('mobileDate').value);
      if (!isNaN(newDate)) {
        mobileCurrentDate = newDate;
        renderMobileCard(mobileCurrentDate);
      }
    }

    renderMobileCard(mobileCurrentDate);

    document.addEventListener('keydown', function(e) {
      if (window.innerWidth < 768) {
        if (e.key === 'ArrowRight') {
          slideMobileCard('left');
        } else if (e.key === 'ArrowLeft') {
          slideMobileCard('right');
        }
      }
    });

    const mobileCardElem = document.getElementById('mobileCardContainer');
    const hammerMobile = new Hammer(mobileCardElem);
    hammerMobile.on('swipeleft', function() {
      slideMobileCard('left');
    });
    hammerMobile.on('swiperight', function() {
      slideMobileCard('right');
    });

    /********************
     * 列印功能
     ********************/
    function printDailySchedule() {
      const titleText = document.getElementById("dailyScheduleTitle").textContent;
      const printDate = titleText.split(":")[1].trim();
      const daySchedules = schedules.filter(schedule => schedule.date === printDate);
      if (daySchedules.length === 0) {
        alert("當日沒有行程，無法列印！");
        return;
      }
      let totalArea = 0;
      let tableRows = "";
      daySchedules.forEach(schedule => {
        totalArea += schedule.area;
        tableRows += 
          `<tr>
            <td style="border: 1px solid #ccc; padding: 10px;">${printDate}</td>
            <td style="border: 1px solid #ccc; padding: 10px;">${schedule.farmer}</td>
            <td style="border: 1px solid #ccc; padding: 10px; text-align: center;">${schedule.area} 甲</td>
            <td style="border: 1px solid #ccc; padding: 10px;">${schedule.notes}</td>
          </tr>`;
      });
      tableRows += `<tr>
            <td colspan="2" style="border: 1px solid #ccc; padding: 10px; text-align: right;"><strong>總面積:</strong></td>
            <td style="border: 1px solid #ccc; padding: 10px; text-align: center;"><strong>${totalArea} 甲</strong></td>
            <td style="border: 1px solid #ccc; padding: 10px;"></td>
          </tr>`;
      if(totalArea > dailyLimit){
        tableRows += `<tr>
          <td colspan="4" style="border: 1px solid #ccc; padding: 10px; text-align: center; color: red;"><strong>警告：當日排程已超過上限 (${dailyLimit} 甲)！</strong></td>
        </tr>`;
      }
      const originalBody = document.body.innerHTML;
      document.body.innerHTML = 
        `<div style="text-align: center; padding: 20px;">
          <h1 style="font-size: 22px; margin-bottom: 20px;">${printDate} - 插秧行程表</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="background: #34D399; color: white; padding: 10px; border: 1px solid #ccc;">日期</th>
                <th style="background: #34D399; color: white; padding: 10px; border: 1px solid #ccc;">農民姓名</th>
                <th style="background: #34D399; color: white; padding: 10px; border: 1px solid #ccc;">面積（甲）</th>
                <th style="background: #34D399; color: white; padding: 10px; border: 1px solid #ccc;">備註</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>`;
      window.print();
      location.reload();
    }

    renderCalendar();