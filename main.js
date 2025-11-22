
class SummaryCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const type = this.getAttribute('type');

    const icons = {
      sessions: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
      'listen-rate': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="20" x2="8" y2="4"></line><line x1="16" y1="20" x2="16" y2="12"></line></svg>',
      'pending-reps': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6"/><path d="M22 11.5A10 10 0 0 1 12 22C6.5 22 2 17.5 2 12S6.5 2 12 2"/></svg>',
      'due-today': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
      'due-tomorrow': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
    };

    const colors = {
        sessions: { bg: '#eef2ff', icon: '#6366f1' },
        'listen-rate': { bg: '#f0fdf4', icon: '#22c55e' },
        'pending-reps': { bg: '#faf5ff', icon: '#a855f7' },
        'due-today': { bg: '#fff1f2', icon: '#ef4444' },
        'due-tomorrow': { bg: '#ecfeff', icon: '#06b6d4' }
    };

    const cardColors = colors[type] || { bg: '#ffffff', icon: '#333' };

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'card');

    const textContent = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = this.getAttribute('title');
    const value = document.createElement('p');
    value.textContent = this.getAttribute('value');
    textContent.appendChild(title);
    textContent.appendChild(value);

    const iconWrapper = document.createElement('div');
    iconWrapper.setAttribute('class', 'icon');
    iconWrapper.innerHTML = icons[type] || '';

    const style = document.createElement('style');
    style.textContent = `
      :host {
        flex: 1;
      }
      .card {
        background-color: ${cardColors.bg};
        padding: 20px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: all 0.2s ease-in-out;
      }
      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
      }
      h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: #666;
      }
      p {
        margin: 4px 0 0;
        font-size: 28px;
        font-weight: 600;
      }
      .icon svg {
        width: 24px;
        height: 24px;
        stroke: ${cardColors.icon};
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    wrapper.appendChild(textContent);
    wrapper.appendChild(iconWrapper);
    this.valueElement = value; 
  }

  updateValue(newValue) {
      this.valueElement.textContent = newValue;
  }
}
customElements.define('summary-card', SummaryCard);

const loaderOverlay = document.getElementById('loader-overlay');
const mainContainer = document.querySelector('.container');
const alertModal = document.getElementById('alert-modal');

let sessionHistoryData = [];
let upcomingClassesData = [];
let forgettingCurveData = [];
let pendingRepsData = [];
let repsDueTodayData = [];
let repsDueTomorrowData = [];

async function loadDashboardData() {
  const urlParams = new URLSearchParams(window.location.search);
  const student_id = urlParams.get('id');

  if (!student_id) {
    loaderOverlay.style.display = 'none';
    alertModal.classList.add('show');
    return;
  }

  loaderOverlay.classList.add('show');
  console.log(`Student ID from URL parameter "id": ${student_id}`);
  const url = `https://script.google.com/macros/s/AKfycbyYC5J0y6OyT__UGswzVVLpIyREXEWcOxLLypAdt50WpxAwZ34Dvk31S64NLdENwIrx/exec?student_id=${student_id}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const { student_name, student_id: studentId, session_log, upcoming_classes, forgetting_curve } = data;

    document.getElementById('student-name-header').textContent = `${student_name}'s Progress Dashboard`;
    document.getElementById('student-id-span').textContent = `Student ID: ${studentId}`;

    sessionHistoryData = session_log.sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
        startTime: new Date(item.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        endTime: new Date(item.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        listenRate: item.student_listen_rate * 20, // Assuming 5 is 100%
        subject: item.subject,
        teacher: item.teacher
    }));

    upcomingClassesData = upcoming_classes.sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
        startTime: new Date(item.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        endTime: new Date(item.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        subject: item.subject,
        teacher: item.teacher,
        room: item.class_room_id,
        sessionId: item.session_temp_id
    }));
    
    forgettingCurveData = forgetting_curve;

    filterSessionHistory();
    populateUpcomingClasses('upcoming-classes-table', upcomingClassesData);
    updateRepetitionCards();

  } catch (error) {
    console.error("Error fetching API:", error);
  } finally {
    loaderOverlay.classList.remove('show');
    setTimeout(() => {
        loaderOverlay.style.display = 'none';
        mainContainer.style.display = 'block';
    }, 300);
  }
}

function populateSessionHistory(tableId, data) {
    const tableBody = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    data.forEach(rowData => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = rowData.date;
        row.insertCell().textContent = `${rowData.startTime} - ${rowData.endTime}`;

        const listenRateCell = row.insertCell();
        const listenRateSpan = document.createElement('span');
        listenRateSpan.textContent = `${rowData.listenRate}%`;
        listenRateSpan.classList.add('listen-rate');
        if (rowData.listenRate >= 90) listenRateSpan.classList.add('high');
        else if (rowData.listenRate >= 75) listenRateSpan.classList.add('medium');
        else listenRateSpan.classList.add('low');
        listenRateCell.appendChild(listenRateSpan);

        const subjectCell = row.insertCell();
        subjectCell.textContent = rowData.subject;
        subjectCell.classList.add('subject');
        row.insertCell().textContent = rowData.teacher;
    });
}

function populateUpcomingClasses(tableId, data) {
    const tableBody = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    data.forEach(rowData => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = rowData.date;
        row.insertCell().textContent = `${rowData.startTime} - ${rowData.endTime}`;
        const subjectCell = row.insertCell();
        subjectCell.textContent = rowData.subject;
        subjectCell.classList.add('subject');
        row.insertCell().textContent = rowData.teacher;
        row.insertCell().textContent = rowData.room;
        row.insertCell().textContent = rowData.sessionId;
    });
}

function updateRepetitionCards() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    pendingRepsData = forgettingCurveData.filter(r => {
        const repDate = new Date(r.repetition_date);
        repDate.setHours(0,0,0,0);
        return r.learned_update === "" && repDate <= today;
    });

    repsDueTodayData = forgettingCurveData.filter(r => {
        const repDate = new Date(r.repetition_date);
        repDate.setHours(0,0,0,0);
        return r.learned_update === "" && repDate.getTime() === today.getTime();
    });

    repsDueTomorrowData = forgettingCurveData.filter(r => {
        const repDate = new Date(r.repetition_date);
        repDate.setHours(0,0,0,0);
        return r.learned_update === "" && repDate.getTime() === tomorrow.getTime();
    });


    document.getElementById('total-pending-reps').updateValue(pendingRepsData.length);
    document.getElementById('reps-due-today').updateValue(repsDueTodayData.length);
    document.getElementById('reps-due-tomorrow').updateValue(repsDueTomorrowData.length);
}


const tableViewBtn = document.getElementById('table-view-btn');
const calendarViewBtn = document.getElementById('calendar-view-btn');
const tableView = document.getElementById('table-view');
const calendarView = document.getElementById('calendar-view');
const monthYearEl = document.getElementById('month-year');
const calendarDaysEl = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const periodSelect = document.getElementById('period');

let currentDate = new Date();
let filteredSessionHistory = [];

function renderCalendar() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    monthYearEl.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
    calendarDaysEl.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendarDaysEl.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.textContent = day;

        const daySessions = filteredSessionHistory.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate.getFullYear() === year && sessionDate.getMonth() === month && sessionDate.getDate() === day;
        });

        if (daySessions.length > 0) {
            const avgListenRate = daySessions.reduce((acc, s) => acc + s.listenRate, 0) / daySessions.length;
            if (avgListenRate >= 90) dayCell.classList.add('green');
            else if (avgListenRate >= 75) dayCell.classList.add('yellow');
            else dayCell.classList.add('red');
        }

        calendarDaysEl.appendChild(dayCell);
    }
}

function filterSessionHistory() {
    const selectedPeriod = periodSelect.value;
    const now = new Date(); 
    let startDate = new Date(now);
    
    switch (selectedPeriod) {
        case 'all-time':
            filteredSessionHistory = [...sessionHistoryData];
            break;
        case 'last-7-days':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'last-30-days':
            startDate.setDate(now.getDate() - 30);
            break;
        case 'this-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'last-3-months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            break;
        case 'this-year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
    }

    if (selectedPeriod !== 'all-time') {
        filteredSessionHistory = sessionHistoryData.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= now;
        });
    }
    
    populateSessionHistory('session-history-table', filteredSessionHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
    renderCalendar();

    const totalSessions = filteredSessionHistory.length;
    const avgListenRate = totalSessions > 0 ? (filteredSessionHistory.reduce((acc, s) => acc + s.listenRate, 0) / totalSessions).toFixed(1) : 0;

    document.getElementById('total-sessions').updateValue(totalSessions);
    document.getElementById('avg-listen-rate').updateValue(`${avgListenRate}%`);
}

tableViewBtn.addEventListener('click', () => {
    tableView.classList.remove('hidden');
    calendarView.classList.add('hidden');
    tableViewBtn.classList.add('active');
    calendarViewBtn.classList.remove('active');
});

calendarViewBtn.addEventListener('click', () => {
    tableView.classList.add('hidden');
    calendarView.classList.remove('hidden');
    tableViewBtn.classList.remove('active');
    calendarViewBtn.classList.add('active');
    renderCalendar();
});

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

periodSelect.addEventListener('change', filterSessionHistory);

// Repetition Modal
const repetitionModal = document.getElementById('repetition-modal');
const modalTitle = document.getElementById('modal-title');
const repetitionTableBody = document.getElementById('repetition-table').getElementsByTagName('tbody')[0];

function openRepetitionModal(title, data) {
    modalTitle.textContent = title;
    repetitionTableBody.innerHTML = '';
    data.forEach(item => {
        const row = repetitionTableBody.insertRow();
        row.insertCell().textContent = new Date(item.repetition_date).toLocaleDateString();
        row.insertCell().textContent = item.curve_id;
        row.insertCell().textContent = item.repetition_no;
    });
    repetitionModal.classList.add('show');
}

function closeRepetitionModal() {
    repetitionModal.classList.remove('show');
}

window.addEventListener('click', (event) => {
    if (event.target == repetitionModal) {
        closeRepetitionModal();
    }
});

document.getElementById('total-pending-reps').addEventListener('click', () => {
    openRepetitionModal('Total Pending Reps', pendingRepsData);
});

document.getElementById('reps-due-today').addEventListener('click', () => {
    openRepetitionModal('Reps Due: TODAY', repsDueTodayData);
});

document.getElementById('reps-due-tomorrow').addEventListener('click', () => {
    openRepetitionModal('Reps Due: TOMORROW', repsDueTomorrowData);
});



// Initial Population
loadDashboardData();
