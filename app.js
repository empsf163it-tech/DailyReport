/* ==========================================================================
   DAILY WORK REPORT & WHATSAPP/SLACK GENERATOR - APP LOGIC (V4 DUAL PLATFORM)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // State Management
  const state = {
    userName: 'Vamsi Krishna',
    userRole: 'Developer', // 'Developer' or 'Tester'
    colleagueName: 'Manager / Team Lead',
    whatsappPhone: '',
    slackWebhook: '',
    previewPlatform: 'whatsapp', // 'whatsapp' or 'slack'
    loginTime: '07:30',
    logoutTime: '16:30',
    projects: ['InfoTech Websites', 'SmartFusion Websites'],
    breaks: [
      { id: 'b1', name: 'Lunch Break', duration: 45 },
      { id: 'b2', name: 'Tea Break', duration: 15 }
    ],
    tasks: [
      { id: 't1', title: 'Assessment of the complete new InfoTech project websites', project: 'InfoTech Websites', status: 'Completed', hours: 1, minutes: 0, duration: '1h' },
      { id: 't2', title: 'Created New GIT for all websites', project: 'InfoTech Websites', status: 'In Development', hours: 1, minutes: 0, duration: '1h' }
    ],
    blockers: '',
    tomorrowPlan: 'Today By EOD Planning to create at least 2 websites.',
    history: []
  };

  const DEVELOPER_STATUSES = [
    { label: 'Completed', icon: '🟢', slackEmoji: ':white_check_mark:' },
    { label: 'In Development', icon: '🔵', slackEmoji: ':large_blue_circle:' },
    { label: 'Initialized', icon: '⚡', slackEmoji: ':zap:' },
    { label: 'In Testing', icon: '🟣', slackEmoji: ':purple_heart:' },
    { label: 'Correcting', icon: '🟤', slackEmoji: ':warning:' },
    { label: 'Corrected', icon: '✨', slackEmoji: ':sparkles:' },
    { label: 'Not Started', icon: '🔴', slackEmoji: ':red_circle:' }
  ];

  const TESTER_STATUSES = [
    { label: 'Testing Completed', icon: '🟢', slackEmoji: ':white_check_mark:' },
    { label: 'In Testing', icon: '⚙️', slackEmoji: ':gear:' },
    { label: 'Re-Testing', icon: '🔄', slackEmoji: ':arrows_counterclockwise:' },
    { label: 'Rework Needed', icon: '🟤', slackEmoji: ':warning:' },
    { label: 'Testing Not Started', icon: '🔴', slackEmoji: ':red_circle:' }
  ];

  // DOM Elements
  const userNameInput = document.getElementById('userName');
  const userRoleSelect = document.getElementById('userRole');
  const colleagueNameInput = document.getElementById('colleagueName');
  const whatsappPhoneInput = document.getElementById('whatsappPhone');
  const slackWebhookInput = document.getElementById('slackWebhook');
  
  const loginTimeInput = document.getElementById('loginTime');
  const logoutTimeInput = document.getElementById('logoutTime');

  const grossShiftValue = document.getElementById('grossShiftValue');
  const totalBreaksValue = document.getElementById('totalBreaksValue');
  const netWorkingValue = document.getElementById('netWorkingValue');

  const projectsList = document.getElementById('projectsList');
  const btnAddProject = document.getElementById('btnAddProject');

  const tasksList = document.getElementById('tasksList');
  const breaksList = document.getElementById('breaksList');
  const blockersInput = document.getElementById('blockersInput');
  const tomorrowPlanInput = document.getElementById('tomorrowPlanInput');

  // Preview elements
  const tabWhatsapp = document.getElementById('tabWhatsapp');
  const tabSlack = document.getElementById('tabSlack');
  const whatsappShell = document.getElementById('whatsappShell');
  const slackShell = document.getElementById('slackShell');
  const whatsappActions = document.getElementById('whatsappActions');
  const slackActions = document.getElementById('slackActions');

  const reportPreviewContent = document.getElementById('reportPreviewContent');
  const slackPreviewContent = document.getElementById('slackPreviewContent');
  const previewRecipientName = document.getElementById('previewRecipientName');
  const currentDateBadge = document.getElementById('currentDateBadge');

  // Action Buttons
  const btnSendWhatsapp = document.getElementById('btnSendWhatsapp');
  const btnCopyReport = document.getElementById('btnCopyReport');
  const btnSendSlackWebhook = document.getElementById('btnSendSlackWebhook');
  const btnCopySlackReport = document.getElementById('btnCopySlackReport');
  
  const btnSaveHistory = document.getElementById('btnSaveHistory');
  const btnSaveHistorySlack = document.getElementById('btnSaveHistorySlack');
  const btnResetForm = document.getElementById('btnResetForm');
  const btnLoadSample = document.getElementById('btnLoadSample');
  
  const btnAddBreak = document.getElementById('btnAddBreak');
  const btnQuickLunch = document.getElementById('btnQuickLunch');
  const btnQuickTea = document.getElementById('btnQuickTea');
  const btnAddTask = document.getElementById('btnAddTask');

  const historyModal = document.getElementById('historyModal');
  const btnOpenHistory = document.getElementById('btnOpenHistory');
  const btnCloseHistory = document.getElementById('btnCloseHistory');
  const btnCloseHistoryFooter = document.getElementById('btnCloseHistoryFooter');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const historyListContainer = document.getElementById('historyListContainer');
  const historyCountBadge = document.getElementById('historyCount');

  function init() {
    setupDate();
    loadFromLocalStorage();
    bindEvents();
    renderAll();
  }

  function setupDate() {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    currentDateBadge.textContent = `📅 ${now.toLocaleDateString('en-IN', options)}`;
  }

  // Time Engine
  function calculateHours() {
    const loginStr = loginTimeInput.value || '07:30';
    const logoutStr = logoutTimeInput.value || '16:30';

    const loginMins = timeStrToMinutes(loginStr);
    let logoutMins = timeStrToMinutes(logoutStr);

    if (logoutMins < loginMins) {
      logoutMins += 24 * 60;
    }

    const grossShiftMins = Math.max(0, logoutMins - loginMins);
    const totalBreakMins = state.breaks.reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0);
    const netWorkingMins = Math.max(0, grossShiftMins - totalBreakMins);

    grossShiftValue.textContent = formatMinutesToHoursStr(grossShiftMins);
    totalBreaksValue.textContent = formatMinutesToHoursStr(totalBreakMins);
    netWorkingValue.textContent = formatMinutesToHoursStr(netWorkingMins);

    return {
      grossShiftMins,
      totalBreakMins,
      netWorkingMins,
      loginFormatted: format12Hour(loginStr),
      logoutFormatted: format12Hour(logoutStr)
    };
  }

  function timeStrToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  function formatMinutesToHoursStr(totalMinutes) {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs} hrs`;
    return `${hrs} hrs ${mins} mins`;
  }

  function format12Hour(time24) {
    if (!time24) return '';
    let [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minsStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minsStr} ${ampm}`;
  }

  // Render Projects List
  function renderProjects() {
    projectsList.innerHTML = '';
    state.projects.forEach((proj, idx) => {
      const tag = document.createElement('div');
      tag.className = 'project-tag';
      tag.innerHTML = `
        📁 ${escapeHtml(proj)}
        <span class="btn-remove-project" data-index="${idx}" title="Remove Project">&times;</span>
      `;
      projectsList.appendChild(tag);
    });
  }

  // Render Breaks List
  function renderBreaks() {
    breaksList.innerHTML = '';
    if (state.breaks.length === 0) {
      breaksList.innerHTML = `<div class="empty-list-notice">No breaks taken. (0 mins total break)</div>`;
      return;
    }

    state.breaks.forEach((b, index) => {
      const div = document.createElement('div');
      div.className = 'dynamic-item';
      div.innerHTML = `
        <div class="break-item-grid">
          <input type="text" value="${escapeHtml(b.name)}" placeholder="Break Name (e.g. Lunch)" data-index="${index}" data-field="name">
          <div style="display:flex; align-items:center; gap:4px;">
            <input type="number" value="${b.duration}" min="0" max="480" data-index="${index}" data-field="duration">
            <span style="font-size:12px; color:var(--text-muted);">mins</span>
          </div>
          <span style="font-size:12px; color:var(--accent-amber); font-weight:600;">☕ ${b.duration || 0}m</span>
          <button class="btn-icon-danger btn-delete-break" data-index="${index}" title="Remove Break">&times;</button>
        </div>
      `;
      breaksList.appendChild(div);
    });
  }

  function getStatusObj(statusLabel) {
    const allStatuses = [...DEVELOPER_STATUSES, ...TESTER_STATUSES];
    const upper = (statusLabel || '').toUpperCase();
    const match = allStatuses.find(s => s.label.toUpperCase() === upper);
    if (match) return match;
    if (upper === 'CREATING') return DEVELOPER_STATUSES.find(s => s.label === 'In Development') || DEVELOPER_STATUSES[1];
    if (upper === 'REWORK') return DEVELOPER_STATUSES.find(s => s.label === 'Correcting') || DEVELOPER_STATUSES[4];
    return { label: statusLabel || 'Completed', icon: '🔹', slackEmoji: ':white_check_mark:' };
  }

  function getTaskHours(t) {
    if (t.hours !== undefined && t.hours !== null && t.hours !== '') {
      return parseInt(t.hours) || 0;
    }
    const str = (t.duration || '').trim().toLowerCase();
    const hMatch = str.match(/(\d+(?:\.\d+)?)\s*h/);
    if (hMatch) return Math.floor(parseFloat(hMatch[1]) || 0);
    if (!str.includes('m') && !isNaN(parseFloat(str))) return Math.floor(parseFloat(str) || 0);
    return 0;
  }

  function getTaskMinutes(t) {
    if (t.minutes !== undefined && t.minutes !== null && t.minutes !== '') {
      return parseInt(t.minutes) || 0;
    }
    const str = (t.duration || '').trim().toLowerCase();
    const mMatch = str.match(/(\d+)\s*m/);
    if (mMatch) return parseInt(mMatch[1]) || 0;
    const hMatch = str.match(/(\d+\.(\d+))\s*h/);
    if (hMatch) return Math.round((parseFloat(hMatch[1]) % 1) * 60);
    return 0;
  }

  function getFormattedTaskDuration(t) {
    const hrs = getTaskHours(t);
    const mins = getTaskMinutes(t);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    if (mins > 0) return `${mins}m`;
    if (t.duration && t.duration.trim()) return t.duration.trim();
    return '';
  }

  // Render Tasks List
  function renderTasks() {
    tasksList.innerHTML = '';
    if (state.tasks.length === 0) {
      tasksList.innerHTML = `<div class="empty-list-notice">No tasks added yet. Click "+ Add Task Item" to create work logs.</div>`;
      return;
    }

    const availableStatuses = state.userRole === 'Tester' ? TESTER_STATUSES : DEVELOPER_STATUSES;

    state.tasks.forEach((t, index) => {
      let projectOptionsHtml = state.projects.map(p => 
        `<option value="${escapeHtml(p)}" ${t.project === p ? 'selected' : ''}>📁 ${escapeHtml(p)}</option>`
      ).join('');

      if (!t.project) {
        projectOptionsHtml = `<option value="InfoTech Websites" selected>📁 InfoTech Websites</option>` + projectOptionsHtml;
      }

      let statusOptionsHtml = availableStatuses.map(s =>
        `<option value="${escapeHtml(s.label)}" ${t.status === s.label ? 'selected' : ''}>${s.icon} ${escapeHtml(s.label)}</option>`
      ).join('');

      const div = document.createElement('div');
      div.className = 'dynamic-item';
      div.innerHTML = `
        <div class="task-item-grid">
          <input type="text" value="${escapeHtml(t.title)}" placeholder="Task description..." data-index="${index}" data-field="title">
          <select data-index="${index}" data-field="project">
            ${projectOptionsHtml}
          </select>
          <select data-index="${index}" data-field="status">
            ${statusOptionsHtml}
          </select>
          <div class="task-duration-picker" title="Task duration in hours and minutes">
            <div class="duration-unit">
              <input type="number" min="0" max="24" value="${getTaskHours(t)}" placeholder="0" data-index="${index}" data-field="hours">
              <span class="unit-text">h</span>
            </div>
            <div class="duration-unit">
              <input type="number" min="0" max="59" value="${getTaskMinutes(t)}" placeholder="0" data-index="${index}" data-field="minutes">
              <span class="unit-text">m</span>
            </div>
          </div>
          <button class="btn-icon-danger btn-delete-task" data-index="${index}" title="Remove Task">&times;</button>
        </div>
      `;
      tasksList.appendChild(div);
    });
  }

  // WhatsApp Formatter
  function generateWhatsAppReportText() {
    const hoursData = calculateHours();
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const user = state.userName.trim() ? state.userName.trim() : 'Team Member';

    let text = '';
    text += `🚀 *DAILY WORK REPORT* (${todayStr})\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *Name:* ${user} _(${state.userRole})_\n`;
    text += `⏰ *Shift:* ${hoursData.loginFormatted} - ${hoursData.logoutFormatted} _(${formatMinutesToHoursStr(hoursData.netWorkingMins)} Net Work)_\n`;
    text += `☕ *Breaks:* ${formatMinutesToHoursStr(hoursData.totalBreakMins)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📋 *TASKS DONE:*\n`;

    const projectGroups = {};
    state.tasks.forEach(t => {
      const projKey = t.project || 'InfoTech Websites';
      if (!projectGroups[projKey]) projectGroups[projKey] = [];
      projectGroups[projKey].push(t);
    });

    Object.keys(projectGroups).forEach(proj => {
      text += `\n📁 *PROJECT: ${proj}*\n`;
      projectGroups[proj].forEach(t => {
        const sObj = getStatusObj(t.status);
        const durStr = getFormattedTaskDuration(t);
        const dur = durStr ? ` _(${durStr})_` : '';
        text += `${sObj.icon} *[${t.status}]* ${t.title}${dur}\n`;
      });
    });

    if (state.blockers.trim()) {
      text += `\n🚨 *BLOCKERS / PENDING:* \n${state.blockers.trim()}\n`;
    }

    if (state.tomorrowPlan.trim()) {
      text += `\n📌 *Notes / Next Targets:* ${state.tomorrowPlan.trim()}\n`;
    }

    text += `\nThank you! 🙏`;
    return text;
  }

  // Slack Formatter
  function generateSlackReportText() {
    const hoursData = calculateHours();
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const user = state.userName.trim() ? state.userName.trim() : 'Team Member';

    let text = '';
    text += `:rocket: *DAILY WORK REPORT* (${todayStr})\n`;
    text += `──────────────────────────────────\n`;
    text += `:bust_in_silhouette: *Name:* ${user} _(${state.userRole})_\n`;
    text += `:alarm_clock: *Shift:* ${hoursData.loginFormatted} - ${hoursData.logoutFormatted} _(${formatMinutesToHoursStr(hoursData.netWorkingMins)} Net Work)_\n`;
    text += `:coffee: *Breaks:* ${formatMinutesToHoursStr(hoursData.totalBreakMins)}\n`;
    text += `──────────────────────────────────\n\n`;
    text += `:clipboard: *TASKS DONE:*\n`;

    const projectGroups = {};
    state.tasks.forEach(t => {
      const projKey = t.project || 'InfoTech Websites';
      if (!projectGroups[projKey]) projectGroups[projKey] = [];
      projectGroups[projKey].push(t);
    });

    Object.keys(projectGroups).forEach(proj => {
      text += `\n:file_folder: *PROJECT: ${proj}*\n`;
      projectGroups[proj].forEach(t => {
        const sObj = getStatusObj(t.status);
        const durStr = getFormattedTaskDuration(t);
        const dur = durStr ? ` _(${durStr})_` : '';
        text += `${sObj.slackEmoji} *[${t.status}]* ${t.title}${dur}\n`;
      });
    });

    if (state.blockers.trim()) {
      text += `\n:warning: *BLOCKERS / PENDING:*\n${state.blockers.trim()}\n`;
    }

    if (state.tomorrowPlan.trim()) {
      text += `\n:dart: *Notes / Next Targets:* ${state.tomorrowPlan.trim()}\n`;
    }

    text += `\nThank you! :pray:`;
    return text;
  }

  // Render Previews
  function renderPreview() {
    // WhatsApp preview
    const waText = generateWhatsAppReportText();
    let waHtml = escapeHtml(waText)
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/~(.*?)~/g, '<del>$1</del>');
    reportPreviewContent.innerHTML = waHtml;

    // Slack preview
    const slackText = generateSlackReportText();
    let slackHtml = escapeHtml(slackText)
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/~(.*?)~/g, '<del>$1</del>');
    slackPreviewContent.innerHTML = slackHtml;

    previewRecipientName.textContent = state.colleagueName.trim() ? `Report to: ${state.colleagueName}` : 'Work Report Chat';

    saveToLocalStorage();
  }

  function switchPlatformTab(platform) {
    state.previewPlatform = platform;
    if (platform === 'slack') {
      tabSlack.classList.add('active');
      tabWhatsapp.classList.remove('active');
      slackShell.classList.remove('hidden');
      whatsappShell.classList.add('hidden');
      slackActions.classList.remove('hidden');
      whatsappActions.classList.add('hidden');
    } else {
      tabWhatsapp.classList.add('active');
      tabSlack.classList.remove('active');
      whatsappShell.classList.remove('hidden');
      slackShell.classList.add('hidden');
      whatsappActions.classList.remove('hidden');
      slackActions.classList.add('hidden');
    }
  }

  function renderAll() {
    userNameInput.value = state.userName;
    userRoleSelect.value = state.userRole;
    colleagueNameInput.value = state.colleagueName;
    whatsappPhoneInput.value = state.whatsappPhone;
    slackWebhookInput.value = state.slackWebhook;
    loginTimeInput.value = state.loginTime;
    logoutTimeInput.value = state.logoutTime;
    blockersInput.value = state.blockers;
    tomorrowPlanInput.value = state.tomorrowPlan;

    switchPlatformTab(state.previewPlatform);
    renderProjects();
    renderBreaks();
    renderTasks();
    calculateHours();
    renderPreview();
    updateHistoryBadge();
  }

  function bindEvents() {
    userNameInput.addEventListener('input', (e) => { state.userName = e.target.value; renderPreview(); });
    userRoleSelect.addEventListener('change', (e) => {
      state.userRole = e.target.value;
      renderTasks();
      renderPreview();
    });
    colleagueNameInput.addEventListener('input', (e) => { state.colleagueName = e.target.value; renderPreview(); });
    whatsappPhoneInput.addEventListener('input', (e) => { state.whatsappPhone = e.target.value; renderPreview(); });
    slackWebhookInput.addEventListener('input', (e) => { state.slackWebhook = e.target.value; saveToLocalStorage(); });
    
    blockersInput.addEventListener('input', (e) => { state.blockers = e.target.value; renderPreview(); });
    tomorrowPlanInput.addEventListener('input', (e) => { state.tomorrowPlan = e.target.value; renderPreview(); });

    loginTimeInput.addEventListener('input', (e) => { state.loginTime = e.target.value; calculateHours(); renderPreview(); });
    logoutTimeInput.addEventListener('input', (e) => { state.logoutTime = e.target.value; calculateHours(); renderPreview(); });

    // Platform Tabs
    tabWhatsapp.addEventListener('click', () => switchPlatformTab('whatsapp'));
    tabSlack.addEventListener('click', () => switchPlatformTab('slack'));

    // Time Presets
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('pill')) {
        const targetId = e.target.getAttribute('data-target');
        const action = e.target.getAttribute('data-action');
        const timeVal = e.target.getAttribute('data-time');
        
        const inputElem = document.getElementById(targetId);
        if (inputElem) {
          if (action === 'now') {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            inputElem.value = `${h}:${m}`;
          } else if (timeVal) {
            inputElem.value = timeVal;
          }

          if (targetId === 'loginTime') state.loginTime = inputElem.value;
          if (targetId === 'logoutTime') state.logoutTime = inputElem.value;
          calculateHours();
          renderPreview();
        }
      }
    });

    // Add Project Button
    btnAddProject.addEventListener('click', () => {
      const projName = prompt('Enter New Project Name:');
      if (projName && projName.trim()) {
        const cleanName = projName.trim();
        if (!state.projects.includes(cleanName)) {
          state.projects.push(cleanName);
          renderProjects();
          renderTasks();
          renderPreview();
          showToast(`Project "${cleanName}" added`, 'success');
        }
      }
    });

    // Remove Project
    projectsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove-project')) {
        const idx = e.target.getAttribute('data-index');
        const removed = state.projects.splice(idx, 1);
        renderProjects();
        renderTasks();
        renderPreview();
        showToast(`Removed project "${removed[0]}"`, 'info');
      }
    });

    // Breaks listeners
    breaksList.addEventListener('input', (e) => {
      const index = e.target.getAttribute('data-index');
      const field = e.target.getAttribute('data-field');
      if (index !== null && field) {
        state.breaks[index][field] = field === 'duration' ? parseInt(e.target.value) || 0 : e.target.value;
        calculateHours();
        renderPreview();
      }
    });

    breaksList.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete-break')) {
        const index = e.target.getAttribute('data-index');
        state.breaks.splice(index, 1);
        renderBreaks();
        calculateHours();
        renderPreview();
      }
    });

    btnQuickLunch.addEventListener('click', () => {
      state.breaks.push({ id: Date.now(), name: 'Lunch Break', duration: 45 });
      renderBreaks();
      calculateHours();
      renderPreview();
      showToast('Added 45m Lunch Break', 'info');
    });

    btnQuickTea.addEventListener('click', () => {
      state.breaks.push({ id: Date.now(), name: 'Tea Break', duration: 15 });
      renderBreaks();
      calculateHours();
      renderPreview();
      showToast('Added 15m Tea Break', 'info');
    });

    btnAddBreak.addEventListener('click', () => {
      state.breaks.push({ id: Date.now(), name: 'Short Break', duration: 15 });
      renderBreaks();
      calculateHours();
      renderPreview();
    });

    // Tasks listeners
    tasksList.addEventListener('input', (e) => {
      const index = e.target.getAttribute('data-index');
      const field = e.target.getAttribute('data-field');
      if (index !== null && field) {
        if (field === 'hours' || field === 'minutes') {
          const val = parseInt(e.target.value);
          state.tasks[index][field] = isNaN(val) ? 0 : val;
          state.tasks[index].duration = getFormattedTaskDuration(state.tasks[index]);
        } else {
          state.tasks[index][field] = e.target.value;
        }
        renderPreview();
      }
    });

    tasksList.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete-task')) {
        const index = e.target.getAttribute('data-index');
        state.tasks.splice(index, 1);
        renderTasks();
        renderPreview();
      }
    });

    btnAddTask.addEventListener('click', () => {
      const defaultProj = state.projects[0] || 'InfoTech Websites';
      const defaultStatus = state.userRole === 'Tester' ? 'In Testing' : 'In Development';
      state.tasks.push({
        id: Date.now(),
        title: 'New project work item',
        project: defaultProj,
        status: defaultStatus,
        hours: 1,
        minutes: 0,
        duration: '1h'
      });
      renderTasks();
      renderPreview();
    });

    // WhatsApp Actions
    btnSendWhatsapp.addEventListener('click', sendToWhatsApp);
    btnCopyReport.addEventListener('click', copyWhatsAppToClipboard);

    // Slack Actions
    btnSendSlackWebhook.addEventListener('click', sendToSlackWebhook);
    btnCopySlackReport.addEventListener('click', copySlackToClipboard);

    // Common Actions
    btnSaveHistory.addEventListener('click', saveToHistory);
    btnSaveHistorySlack.addEventListener('click', saveToHistory);
    btnResetForm.addEventListener('click', resetForm);
    btnLoadSample.addEventListener('click', loadSampleData);

    // Modal
    btnOpenHistory.addEventListener('click', () => {
      renderHistoryModal();
      historyModal.classList.add('open');
    });

    btnCloseHistory.addEventListener('click', () => historyModal.classList.remove('open'));
    btnCloseHistoryFooter.addEventListener('click', () => historyModal.classList.remove('open'));
    btnClearHistory.addEventListener('click', clearHistory);
  }

  function sendToWhatsApp() {
    const reportText = generateWhatsAppReportText();
    const encodedText = encodeURIComponent(reportText);
    let rawPhone = state.whatsappPhone.replace(/[^0-9]/g, '');

    let whatsappUrl = rawPhone
      ? `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
    showToast('Opening WhatsApp...', 'success');
  }

  function copyWhatsAppToClipboard() {
    const reportText = generateWhatsAppReportText();
    navigator.clipboard.writeText(reportText).then(() => {
      showToast('📋 WhatsApp report copied to clipboard!', 'success');
    }).catch(err => {
      showToast('Failed to copy: ' + err, 'danger');
    });
  }

  function copySlackToClipboard() {
    const slackText = generateSlackReportText();
    navigator.clipboard.writeText(slackText).then(() => {
      showToast('📋 Slack formatted report copied to clipboard!', 'success');
    }).catch(err => {
      showToast('Failed to copy: ' + err, 'danger');
    });
  }

  function sendToSlackWebhook() {
    const textPayload = generateSlackReportText();
    const webhookUrl = state.slackWebhook ? state.slackWebhook.trim() : '';

    // Copy report text to clipboard so user can paste anywhere in Slack
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textPayload).catch(() => {});
    }

    // Post to Slack Webhook silently if configured (mode: 'no-cors' prevents browser CORS error)
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textPayload })
      }).catch(() => {});
    }

    // Launch Slack App or open Slack Web client
    try {
      window.location.href = 'slack://open';
    } catch (e) {}

    setTimeout(() => {
      window.open('https://app.slack.com/client', '_blank');
    }, 500);

    if (webhookUrl) {
      showToast('🟪 Posted to Slack Webhook & opening Slack!', 'success');
    } else {
      showToast('📋 Copied report to clipboard & opening Slack app!', 'success');
    }
  }

  function saveToHistory() {
    const reportText = state.previewPlatform === 'slack' ? generateSlackReportText() : generateWhatsAppReportText();
    const hoursData = calculateHours();

    const record = {
      id: Date.now(),
      platform: state.previewPlatform,
      timestamp: new Date().toLocaleString('en-IN'),
      netWorking: formatMinutesToHoursStr(hoursData.netWorkingMins),
      taskCount: state.tasks.length,
      text: reportText
    };

    state.history.unshift(record);
    saveToLocalStorage();
    updateHistoryBadge();
    showToast('💾 Saved report to Local History!', 'success');
  }

  function renderHistoryModal() {
    historyListContainer.innerHTML = '';
    if (state.history.length === 0) {
      historyListContainer.innerHTML = `<div class="empty-list-notice">No saved reports in history yet.</div>`;
      return;
    }

    state.history.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'history-card';
      const badgeIcon = item.platform === 'slack' ? '🟪 Slack' : '💬 WhatsApp';
      card.innerHTML = `
        <div class="history-meta">
          <span>📅 ${item.timestamp} (${badgeIcon})</span>
          <span>⌛ ${item.netWorking} | ${item.taskCount} tasks</span>
        </div>
        <div class="history-text">${escapeHtml(item.text)}</div>
        <div class="history-actions">
          <button class="btn btn-xs btn-outline btn-copy-history" data-index="${index}">📋 Copy</button>
          <button class="btn btn-xs btn-icon-danger btn-delete-history" data-index="${index}">&times;</button>
        </div>
      `;
      historyListContainer.appendChild(card);
    });

    historyListContainer.querySelectorAll('.btn-copy-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        navigator.clipboard.writeText(state.history[idx].text);
        showToast('Report text copied!', 'success');
      });
    });

    historyListContainer.querySelectorAll('.btn-delete-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        state.history.splice(idx, 1);
        saveToLocalStorage();
        updateHistoryBadge();
        renderHistoryModal();
      });
    });
  }

  function clearHistory() {
    if (confirm('Clear all saved report history?')) {
      state.history = [];
      saveToLocalStorage();
      updateHistoryBadge();
      renderHistoryModal();
      showToast('History cleared', 'info');
    }
  }

  function updateHistoryBadge() {
    historyCountBadge.textContent = state.history.length;
  }

  function resetForm() {
    state.loginTime = '07:30';
    state.logoutTime = '16:30';
    state.projects = ['InfoTech Websites', 'SmartFusion Websites'];
    state.breaks = [{ id: 'b1', name: 'Lunch Break', duration: 45 }];
    state.tasks = [{ id: 't1', title: 'Website task item', project: 'InfoTech Websites', status: 'Completed', duration: '1h' }];
    state.blockers = '';
    state.tomorrowPlan = '';
    renderAll();
    showToast('Form reset to default', 'info');
  }

  function loadSampleData() {
    state.userName = 'Vamsi Krishna';
    state.userRole = 'Developer';
    state.colleagueName = 'Manager / Team Lead';
    state.loginTime = '11:00';
    state.logoutTime = '13:00';
    state.projects = ['InfoTech Websites', 'SmartFusion Websites'];
    state.breaks = [];
    state.tasks = [
      { id: 't1', title: 'Assessment of the complete new InfoTech project websites', project: 'InfoTech Websites', status: 'Completed', duration: '1h' },
      { id: 't2', title: 'Created New GIT for all websites', project: 'InfoTech Websites', status: 'In Development', duration: '1h' }
    ];
    state.blockers = '';
    state.tomorrowPlan = 'Today By EOD Planning to create at least 2 websites.';
    renderAll();
    showToast('Sample data loaded!', 'success');
  }

  // Local Storage Persistence
  function saveToLocalStorage() {
    try {
      localStorage.setItem('smart_daily_report_v4', JSON.stringify({
        userName: state.userName,
        userRole: state.userRole,
        colleagueName: state.colleagueName,
        whatsappPhone: state.whatsappPhone,
        slackWebhook: state.slackWebhook,
        previewPlatform: state.previewPlatform,
        loginTime: state.loginTime,
        logoutTime: state.logoutTime,
        projects: state.projects,
        breaks: state.breaks,
        tasks: state.tasks,
        blockers: state.blockers,
        tomorrowPlan: state.tomorrowPlan,
        history: state.history
      }));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('smart_daily_report_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userName !== undefined) state.userName = parsed.userName;
        if (parsed.userRole !== undefined) state.userRole = parsed.userRole;
        if (parsed.colleagueName !== undefined) state.colleagueName = parsed.colleagueName;
        if (parsed.whatsappPhone !== undefined) state.whatsappPhone = parsed.whatsappPhone;
        if (parsed.slackWebhook !== undefined) state.slackWebhook = parsed.slackWebhook;
        if (parsed.previewPlatform !== undefined) state.previewPlatform = parsed.previewPlatform;
        if (parsed.loginTime !== undefined) state.loginTime = parsed.loginTime;
        if (parsed.logoutTime !== undefined) state.logoutTime = parsed.logoutTime;
        if (parsed.projects !== undefined) state.projects = parsed.projects;
        if (parsed.breaks !== undefined) state.breaks = parsed.breaks;
        if (parsed.tasks !== undefined) state.tasks = parsed.tasks;
        if (parsed.blockers !== undefined) state.blockers = parsed.blockers;
        if (parsed.tomorrowPlan !== undefined) state.tomorrowPlan = parsed.tomorrowPlan;
        if (parsed.history !== undefined) state.history = parsed.history;
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  init();
});
