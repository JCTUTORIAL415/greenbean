
let currentMonth = new Date(2025, 0); // Starting from January 2025
const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
let dailyLimit = 10;  // Default daily limit

// 假資料
const schedules = [
    { date: '2025-02-05', farmer: '王小明', area: 5, notes: '備註1' },
    { date: '2025-02-10', farmer: '張大華', area: 8, notes: '備註2' },
    { date: '2025-02-15', farmer: '李小花', area: 12, notes: '備註3' },
    { date: '2025-02-20', farmer: '劉國華', area: 7, notes: '備註4' }
];

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
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

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    // Clear previous calendar
    calendar.innerHTML = '';

    // Add empty cells for the previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'border-b', 'border-r', 'p-2', 'bg-gray-50');
        calendar.appendChild(emptyCell);
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day', 'border-b', 'border-r', 'p-2');
        dayCell.innerHTML = `<div class="text-center font-medium">${day}</div>`;

        // Get the date string for this day
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Add scheduled events
        const scheduledItems = schedules.filter(schedule => {
            return schedule.date === dateStr;
        });

        let totalArea = 0;
        scheduledItems.forEach(schedule => {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.classList.add('schedule-item');
            scheduleDiv.textContent = `${schedule.farmer} (${schedule.area}甲)`;
            dayCell.appendChild(scheduleDiv);
            totalArea += schedule.area;
        });

        // Check if the total area exceeds the daily limit
        if (totalArea > dailyLimit) {
            dayCell.classList.add('over-limit');
            const warningDiv = document.createElement('div');
            warningDiv.classList.add('schedule-item', 'over-limit');
            warningDiv.textContent = `超過上限 (${totalArea}甲)`;
            dayCell.appendChild(warningDiv);
        }

        // Add click event to show daily schedule
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

function addSchedule() {
    const date = document.getElementById('scheduleDate').value;
    const farmer = document.getElementById('farmerName').value;
    const area = parseFloat(document.getElementById('area').value);
    const notes = document.getElementById('notes').value;

    if (!date || !farmer || !area) {
        alert('請填寫所有欄位');
        return;
    }

    // Check if the daily limit is exceeded
    const day = new Date(date).getDate();
    const daySchedules = schedules.filter(schedule => {
        return new Date(schedule.date).getDate() === day;
    });

    const totalArea = daySchedules.reduce((total, schedule) => total + schedule.area, 0);

    if (totalArea + area > dailyLimit) {
        alert('超過每日插秧上限');
        return;
    }

    schedules.push({ date, farmer, area, notes });
    renderCalendar();
    hideAddSchedule();
}

function updateDailyLimit() {
    dailyLimit = parseFloat(document.getElementById('dailyLimit').value);
    renderCalendar();
}

function renderMobileSchedule() {
    const date = document.getElementById('mobileDate').value;
    const mobileSchedule = document.getElementById('mobileSchedule');
    const scheduledItems = schedules.filter(schedule => schedule.date === date);

    mobileSchedule.innerHTML = '';

    if (scheduledItems.length === 0) {
        mobileSchedule.innerHTML = '<p>當日無排程</p>';
    } else {
        scheduledItems.forEach(schedule => {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.classList.add('schedule-item', 'mb-2');
            scheduleDiv.textContent = `${schedule.farmer} (${schedule.area}甲) - ${schedule.notes}`;
            mobileSchedule.appendChild(scheduleDiv);
        });
    }
}

function printCalendar() {
    window.print();
}

renderCalendar();
